import { Injectable } from '@nestjs/common';

import { type GaxiosError } from 'gaxios';
import { type admin_directory_v1, google } from 'googleapis';
import { isDefined } from 'twenty-shared/utils';

import {
  EmailForwardingDriverException,
  EmailForwardingDriverExceptionCode,
} from 'src/engine/core-modules/email-forwarding/drivers/exceptions/email-forwarding-driver.exception';
import { GOOGLE_DIRECTORY_RETRY_COUNT } from 'src/engine/core-modules/email-forwarding/drivers/google/constants/google-directory-retry-count.constant';
import { GOOGLE_DIRECTORY_RETRY_DELAY_MS } from 'src/engine/core-modules/email-forwarding/drivers/google/constants/google-directory-retry-delay-ms.constant';
import { parseGoogleEmailForwardingError } from 'src/engine/core-modules/email-forwarding/drivers/google/utils/parse-google-email-forwarding-error.util';
import { type EmailForwardingDriverInterface } from 'src/engine/core-modules/email-forwarding/drivers/interfaces/email-forwarding-driver.interface';
import { type CreateForwardingAddressInput } from 'src/engine/core-modules/email-forwarding/drivers/types/create-forwarding-address-input.type';
import { type DeleteForwardingAddressInput } from 'src/engine/core-modules/email-forwarding/drivers/types/delete-forwarding-address-input.type';

@Injectable()
export class GoogleEmailForwardingService implements EmailForwardingDriverInterface {
  async createForwardingAddress({
    sourceAddress,
    destinationAddress,
    displayName,
    accessToken,
  }: CreateForwardingAddressInput): Promise<void> {
    const directory = this.getDirectoryClient(accessToken);

    const group =
      (await this.findGroup(directory, sourceAddress)) ??
      (await this.createGroup(directory, sourceAddress, displayName));

    if (!isDefined(group.id)) {
      throw new EmailForwardingDriverException(
        `Google returned the group for ${sourceAddress} without an id`,
        EmailForwardingDriverExceptionCode.UNKNOWN,
      );
    }

    await this.addDestinationMember(directory, group.id, destinationAddress);
    await this.allowExternalDelivery(accessToken, sourceAddress);
  }

  async deleteForwardingAddress({
    sourceAddress,
    destinationAddress,
    accessToken,
  }: DeleteForwardingAddressInput): Promise<void> {
    const directory = this.getDirectoryClient(accessToken);

    try {
      await directory.members.delete({
        groupKey: sourceAddress,
        memberKey: destinationAddress,
      });
    } catch (error) {
      if ((error as GaxiosError).response?.status === 404) {
        return;
      }

      throw parseGoogleEmailForwardingError(error as GaxiosError, {
        cause: error as Error,
      });
    }
  }

  private getDirectoryClient(accessToken: string): admin_directory_v1.Admin {
    return google.admin({
      version: 'directory_v1',
      auth: this.getAuthClient(accessToken),
    });
  }

  private getAuthClient(accessToken: string) {
    const authClient = new google.auth.OAuth2();

    authClient.setCredentials({ access_token: accessToken });

    return authClient;
  }

  private async findGroup(
    directory: admin_directory_v1.Admin,
    sourceAddress: string,
  ): Promise<admin_directory_v1.Schema$Group | null> {
    try {
      const { data } = await directory.groups.get({ groupKey: sourceAddress });

      return data;
    } catch (error) {
      if ((error as GaxiosError).response?.status === 404) {
        return null;
      }

      throw parseGoogleEmailForwardingError(error as GaxiosError, {
        cause: error as Error,
      });
    }
  }

  private async createGroup(
    directory: admin_directory_v1.Admin,
    sourceAddress: string,
    displayName: string,
  ): Promise<admin_directory_v1.Schema$Group> {
    try {
      const { data } = await directory.groups.insert({
        requestBody: { email: sourceAddress, name: displayName },
      });

      return data;
    } catch (error) {
      const parsedError = parseGoogleEmailForwardingError(
        error as GaxiosError,
        {
          cause: error as Error,
        },
      );

      if (
        parsedError.code ===
        EmailForwardingDriverExceptionCode.SOURCE_ADDRESS_UNAVAILABLE
      ) {
        throw new EmailForwardingDriverException(
          `${sourceAddress} already exists in Google Workspace as something other than a group, so it cannot forward mail. Use a group address, or set forwarding up manually.`,
          EmailForwardingDriverExceptionCode.SOURCE_ADDRESS_UNAVAILABLE,
          { cause: error as Error },
        );
      }

      throw parsedError;
    }
  }

  private async allowExternalDelivery(
    accessToken: string,
    sourceAddress: string,
  ): Promise<void> {
    const groupsSettings = google.groupssettings({
      version: 'v1',
      auth: this.getAuthClient(accessToken),
    });

    // A newly created group is not readable across Google's replicas straight away,
    // so the settings write can bounce before the group becomes visible.
    for (let attempt = 1; attempt <= GOOGLE_DIRECTORY_RETRY_COUNT; attempt++) {
      try {
        await groupsSettings.groups.patch({
          groupUniqueId: sourceAddress,
          requestBody: {
            allowExternalMembers: 'true',
            whoCanPostMessage: 'ANYONE_CAN_POST',
            messageModerationLevel: 'MODERATE_NONE',
          },
        });

        return;
      } catch (error) {
        const status = (error as GaxiosError).response?.status;
        const isNotPropagatedYet = status === 404 || status === 503;

        if (!isNotPropagatedYet || attempt === GOOGLE_DIRECTORY_RETRY_COUNT) {
          throw parseGoogleEmailForwardingError(error as GaxiosError, {
            cause: error as Error,
          });
        }

        await new Promise((resolve) =>
          setTimeout(resolve, GOOGLE_DIRECTORY_RETRY_DELAY_MS),
        );
      }
    }
  }

  private async addDestinationMember(
    directory: admin_directory_v1.Admin,
    groupId: string,
    destinationAddress: string,
  ): Promise<void> {
    for (let attempt = 1; attempt <= GOOGLE_DIRECTORY_RETRY_COUNT; attempt++) {
      try {
        await directory.members.insert({
          groupKey: groupId,
          requestBody: { email: destinationAddress, role: 'MEMBER' },
        });

        return;
      } catch (error) {
        const status = (error as GaxiosError).response?.status;

        if (status === 409) {
          return;
        }

        const isNotPropagatedYet = status === 404 || status === 503;

        if (!isNotPropagatedYet || attempt === GOOGLE_DIRECTORY_RETRY_COUNT) {
          throw parseGoogleEmailForwardingError(error as GaxiosError, {
            cause: error as Error,
          });
        }

        await new Promise((resolve) =>
          setTimeout(resolve, GOOGLE_DIRECTORY_RETRY_DELAY_MS),
        );
      }
    }
  }
}
