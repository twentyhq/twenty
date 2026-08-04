import { Injectable, Logger } from '@nestjs/common';

import { google } from 'googleapis';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

type GoogleApiServiceCheckResult = {
  isAvailable: boolean;
  isRateLimited: boolean;
};

export type GoogleApisServiceAvailability = {
  isMessagingAvailable: boolean;
  isCalendarAvailable: boolean;
  isMessagingRateLimited?: boolean;
  isCalendarRateLimited?: boolean;
};

@Injectable()
export class GoogleApisServiceAvailabilityService {
  private readonly logger = new Logger(
    GoogleApisServiceAvailabilityService.name,
  );

  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  async checkServicesAvailability(
    accessToken: string,
  ): Promise<GoogleApisServiceAvailability> {
    const oAuth2Client = new google.auth.OAuth2(
      this.twentyConfigService.get('AUTH_GOOGLE_CLIENT_ID'),
      this.twentyConfigService.get('AUTH_GOOGLE_CLIENT_SECRET'),
    );

    oAuth2Client.setCredentials({
      access_token: accessToken,
    });

    const [messagingAvailability, calendarAvailability] = await Promise.all([
      this.checkMessagingAvailability(oAuth2Client),
      this.checkCalendarAvailability(oAuth2Client),
    ]);

    return {
      isMessagingAvailable: messagingAvailability.isAvailable,
      isCalendarAvailable: calendarAvailability.isAvailable,
      ...(messagingAvailability.isRateLimited && {
        isMessagingRateLimited: true,
      }),
      ...(calendarAvailability.isRateLimited && {
        isCalendarRateLimited: true,
      }),
    };
  }

  private async checkMessagingAvailability(
    oAuth2Client: InstanceType<typeof google.auth.OAuth2>,
  ): Promise<GoogleApiServiceCheckResult> {
    if (!this.twentyConfigService.get('MESSAGING_PROVIDER_GMAIL_ENABLED')) {
      return { isAvailable: false, isRateLimited: false };
    }

    try {
      const gmailClient = google.gmail({
        version: 'v1',
        auth: oAuth2Client,
      });

      await gmailClient.users.getProfile({ userId: 'me' });

      return { isAvailable: true, isRateLimited: false };
    } catch (error) {
      if (this.isServiceNotEnabledError(error)) {
        this.logger.log(
          'Messaging service is not enabled for this Google Workspace account',
        );

        return { isAvailable: false, isRateLimited: false };
      }

      if (this.isQuotaExceededError(error)) {
        this.logger.warn(
          'Gmail quota is exhausted while checking messaging availability',
        );

        return { isAvailable: true, isRateLimited: true };
      }

      this.logger.error('Error checking messaging availability', error);

      throw error;
    }
  }

  private async checkCalendarAvailability(
    oAuth2Client: InstanceType<typeof google.auth.OAuth2>,
  ): Promise<GoogleApiServiceCheckResult> {
    if (!this.twentyConfigService.get('CALENDAR_PROVIDER_GOOGLE_ENABLED')) {
      return { isAvailable: false, isRateLimited: false };
    }

    try {
      const calendarClient = google.calendar({
        version: 'v3',
        auth: oAuth2Client,
      });

      await calendarClient.events.list({
        calendarId: 'primary',
        maxResults: 1,
      });

      return { isAvailable: true, isRateLimited: false };
    } catch (error) {
      if (this.isServiceNotEnabledError(error)) {
        this.logger.log(
          'Calendar service is not enabled for this Google Workspace account',
        );

        return { isAvailable: false, isRateLimited: false };
      }

      if (this.isQuotaExceededError(error)) {
        this.logger.warn(
          'Google Calendar quota is exhausted while checking calendar availability',
        );

        return { isAvailable: true, isRateLimited: true };
      }

      this.logger.error('Error checking Calendar availability', error);

      throw error;
    }
  }

  private isServiceNotEnabledError(error: unknown): boolean {
    const errorResponse = this.getGoogleApiError(error);
    const firstError = errorResponse?.errors?.[0];

    if (!firstError) {
      return false;
    }

    const isFailedPrecondition = firstError.reason === 'failedPrecondition';

    const isServiceNotEnabled =
      firstError.message?.toLowerCase()?.includes('service not enabled') ??
      false;

    const isPreconditionCheckFailed =
      firstError.message
        ?.toLowerCase()
        ?.includes('precondition check failed') ?? false;

    return (
      isFailedPrecondition && (isServiceNotEnabled || isPreconditionCheckFailed)
    );
  }

  private isQuotaExceededError(error: unknown): boolean {
    const errorResponse = this.getGoogleApiError(error);
    const firstError = errorResponse?.errors?.[0];

    const isQuotaExceededReason = [
      'dailyLimitExceeded',
      'rateLimitExceeded',
      'userRateLimitExceeded',
    ].includes(firstError?.reason ?? '');

    return (
      isQuotaExceededReason || errorResponse?.status === 'RESOURCE_EXHAUSTED'
    );
  }

  private getGoogleApiError(error: unknown): {
    status?: string;
    errors?: Array<{ reason?: string; message?: string }>;
  } | null {
    const errorResponse = (
      error as { response?: { data?: { error?: unknown } } }
    )?.response?.data?.error;

    return errorResponse && typeof errorResponse === 'object'
      ? (errorResponse as {
          status?: string;
          errors?: Array<{ reason?: string; message?: string }>;
        })
      : null;
  }
}
