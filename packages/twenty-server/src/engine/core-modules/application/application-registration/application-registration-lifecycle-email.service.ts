import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { msg } from '@lingui/core/macro';
import { render } from '@react-email/render';
import {
  ApplicationClaimedEmail,
  ApplicationListingApprovedEmail,
  ApplicationListingChangeRequestedEmail,
  ApplicationListingRejectedEmail,
  ApplicationListingRequestSubmittedEmail,
} from 'twenty-emails';
import { SOURCE_LOCALE, type APP_LOCALES } from 'twenty-shared/translations';
import { isDefined, isNonEmptyString } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { type ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationListingReviewDecision } from 'src/engine/core-modules/application/application-registration/enums/application-registration-listing-review-decision.enum';
import { DomainServerConfigService } from 'src/engine/core-modules/domain/domain-server-config/services/domain-server-config.service';
import { EmailService } from 'src/engine/core-modules/email/email.service';
import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';

// Sends the transactional emails of the claim / listing lifecycle. Failures
// are logged, never thrown: email delivery must not break the mutation that
// triggered it.
@Injectable()
export class ApplicationRegistrationLifecycleEmailService {
  private readonly logger = new Logger(
    ApplicationRegistrationLifecycleEmailService.name,
  );

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly emailService: EmailService,
    private readonly i18nService: I18nService,
    private readonly domainServerConfigService: DomainServerConfigService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async sendApplicationClaimedEmails(params: {
    registration: ApplicationRegistrationEntity;
    workspaceDisplayName: string;
    claimingUserId: string | null;
  }): Promise<void> {
    const recipients = await this.findInstanceAdmins();

    if (isDefined(params.claimingUserId)) {
      const claimingUser = await this.userRepository.findOne({
        where: { id: params.claimingUserId },
      });

      if (
        isDefined(claimingUser) &&
        !recipients.some((recipient) => recipient.id === claimingUser.id)
      ) {
        recipients.push(claimingUser);
      }
    }

    await this.sendToRecipients(recipients, (locale) => ({
      template: ApplicationClaimedEmail({
        applicationName: params.registration.name,
        workspaceDisplayName: params.workspaceDisplayName,
        locale,
      }),
      subject: this.i18nService
        .getI18nInstance(locale)
        ._(msg`Application claimed`),
    }));
  }

  async sendListingRequestSubmittedEmail(params: {
    registration: ApplicationRegistrationEntity;
  }): Promise<void> {
    const adminApplicationDetailUrl = this.domainServerConfigService
      .buildBaseUrl({
        pathname: `settings/admin-panel/applications/registrations/${params.registration.id}`,
      })
      .toString();

    const recipients = await this.findInstanceAdmins();

    await this.sendToRecipients(recipients, (locale) => ({
      template: ApplicationListingRequestSubmittedEmail({
        applicationName: params.registration.name,
        adminApplicationDetailUrl,
        locale,
      }),
      subject: this.i18nService
        .getI18nInstance(locale)
        ._(msg`New marketplace listing request`),
    }));
  }

  async sendListingReviewedEmail(params: {
    registration: ApplicationRegistrationEntity;
    decision: ApplicationRegistrationListingReviewDecision;
    reason: string | null;
  }): Promise<void> {
    const contactEmail = params.registration.listingRequestContactEmail;

    if (!isNonEmptyString(contactEmail)) {
      this.logger.warn(
        `No listing request contact email on registration ${params.registration.id}; skipping review email`,
      );

      return;
    }

    const locale = SOURCE_LOCALE;
    const i18n = this.i18nService.getI18nInstance(locale);
    const applicationName = params.registration.name;

    const { template, subject } = (() => {
      switch (params.decision) {
        case ApplicationRegistrationListingReviewDecision.APPROVED:
          return {
            template: ApplicationListingApprovedEmail({
              applicationName,
              locale,
            }),
            subject: i18n._(msg`Your application is now listed`),
          };
        case ApplicationRegistrationListingReviewDecision.CHANGE_REQUESTED:
          return {
            template: ApplicationListingChangeRequestedEmail({
              applicationName,
              reason: params.reason,
              locale,
            }),
            subject: i18n._(msg`Changes requested on your listing request`),
          };
        case ApplicationRegistrationListingReviewDecision.REJECTED:
          return {
            template: ApplicationListingRejectedEmail({
              applicationName,
              reason: params.reason,
              locale,
            }),
            subject: i18n._(msg`Marketplace listing request declined`),
          };
      }
    })();

    await this.renderAndSend({ to: contactEmail, template, subject });
  }

  private async findInstanceAdmins(): Promise<UserEntity[]> {
    return this.userRepository.find({
      where: { canAccessFullAdminPanel: true },
    });
  }

  private async sendToRecipients(
    recipients: UserEntity[],
    buildEmail: (locale: keyof typeof APP_LOCALES) => {
      template: ReturnType<typeof ApplicationClaimedEmail>;
      subject: string;
    },
  ): Promise<void> {
    await Promise.allSettled(
      recipients.map((recipient) => {
        const locale = (recipient.locale ||
          SOURCE_LOCALE) as keyof typeof APP_LOCALES;
        const { template, subject } = buildEmail(locale);

        return this.renderAndSend({ to: recipient.email, template, subject });
      }),
    );
  }

  private async renderAndSend(params: {
    to: string;
    template: ReturnType<typeof ApplicationClaimedEmail>;
    subject: string;
  }): Promise<void> {
    try {
      const html = await render(params.template, { pretty: true });
      const text = await render(params.template, { plainText: true });
      const from = `${this.twentyConfigService.get('EMAIL_FROM_NAME')} <${this.twentyConfigService.get('EMAIL_FROM_ADDRESS')}>`;

      await this.emailService.send({
        from,
        to: params.to,
        subject: params.subject,
        html,
        text,
      });
    } catch (error) {
      this.logger.warn(
        `Failed to send "${params.subject}" email to ${params.to}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
