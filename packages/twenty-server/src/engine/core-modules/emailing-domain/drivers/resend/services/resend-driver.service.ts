import { Logger } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import {
  EmailingDomainDriverException,
  EmailingDomainDriverExceptionCode,
} from 'src/engine/core-modules/emailing-domain/drivers/exceptions/emailing-domain-driver.exception';
import {
  type EmailingDomainDriverInterface,
  type EmailingDomainResourceInput,
  type EmailingDomainVerificationResult,
} from 'src/engine/core-modules/emailing-domain/drivers/interfaces/emailing-domain-driver.interface';
import { type ResendDriverConfig } from 'src/engine/core-modules/emailing-domain/drivers/interfaces/driver-config.interface';
import { type ResendApiClientService } from 'src/engine/core-modules/emailing-domain/drivers/resend/services/resend-api-client.service';
import { type ResendDomain } from 'src/engine/core-modules/emailing-domain/drivers/resend/types/resend-domain.type';
import { type ResendSendEmailPayload } from 'src/engine/core-modules/emailing-domain/drivers/resend/types/resend-send-email-payload.type';
import { mapResendDomainRecords } from 'src/engine/core-modules/emailing-domain/drivers/resend/utils/map-resend-domain-records.util';
import { mapResendDomainStatus } from 'src/engine/core-modules/emailing-domain/drivers/resend/utils/map-resend-domain-status.util';
import { RESEND_WORKSPACE_TAG_NAME } from 'src/engine/core-modules/emailing-domain/drivers/resend/constants/resend-workspace-tag-name.constant';
import { EmailingDomainStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-status.type';
import { type EmailingDomainSendEmailRequest } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-send-email-input.type';
import { type EmailingDomainSendEmailResult } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-send-email-result.type';
import { getUnsubscribeBaseUrl } from 'src/engine/core-modules/emailing-domain/drivers/utils/get-unsubscribe-base-url.util';
import { type UnsubscribeContentService } from 'src/engine/core-modules/emailing-domain/services/unsubscribe-content.service';

export class ResendDriver implements EmailingDomainDriverInterface {
  private readonly logger = new Logger(ResendDriver.name);

  constructor(
    private readonly config: ResendDriverConfig,
    private readonly resendApiClientService: ResendApiClientService,
    private readonly unsubscribeContentService: UnsubscribeContentService,
  ) {}

  // Resend has no per-workspace resources: domains are account-level and
  // workspace attribution travels on each send as a tag.
  async provisionWorkspace(workspaceId: string): Promise<void> {
    this.logger.log(
      `No Resend resources to provision for workspace ${workspaceId}`,
    );
  }

  async deprovisionWorkspace(workspaceId: string): Promise<void> {
    this.logger.log(
      `No Resend resources to deprovision for workspace ${workspaceId}`,
    );
  }

  async registerDomain(_input: EmailingDomainResourceInput): Promise<void> {
    // the return-path subdomain is configured by Resend at domain creation
  }

  async verifyDomain(
    input: EmailingDomainResourceInput,
  ): Promise<EmailingDomainVerificationResult> {
    const domain = await this.findOrCreateDomain(input.domain);

    await this.resendApiClientService.verifyDomain(domain.id);

    const refreshedDomain = await this.resendApiClientService.getDomain(
      domain.id,
    );

    return this.toVerificationResult(refreshedDomain);
  }

  async getDomainStatus(
    input: EmailingDomainResourceInput,
  ): Promise<EmailingDomainVerificationResult> {
    const domain = await this.findDomainByName(input.domain);

    if (!isDefined(domain)) {
      return {
        status: EmailingDomainStatus.FAILED,
        verificationRecords: [],
      };
    }

    const detailedDomain = await this.resendApiClientService.getDomain(
      domain.id,
    );

    return this.toVerificationResult(detailedDomain);
  }

  async cleanupDomain(input: EmailingDomainResourceInput): Promise<void> {
    const domain = await this.findDomainByName(input.domain);

    if (!isDefined(domain)) {
      return;
    }

    await this.resendApiClientService.deleteDomain(domain.id).catch((error) => {
      if (
        error instanceof EmailingDomainDriverException &&
        error.code === EmailingDomainDriverExceptionCode.NOT_FOUND
      ) {
        return;
      }
      throw error;
    });
  }

  async sendEmail(
    input: EmailingDomainSendEmailRequest,
  ): Promise<EmailingDomainSendEmailResult> {
    if (!isNonEmptyArray(input.to)) {
      throw new EmailingDomainDriverException(
        'sendEmail requires at least one recipient',
        EmailingDomainDriverExceptionCode.CONFIGURATION_ERROR,
      );
    }

    const unsubscribeBaseUrl = getUnsubscribeBaseUrl(input.emailingDomain);
    const emailToSend = this.unsubscribeContentService.addTo(
      input,
      unsubscribeBaseUrl,
    );

    const payload: ResendSendEmailPayload = {
      from: emailToSend.from,
      to: emailToSend.to,
      cc: emailToSend.cc,
      bcc: emailToSend.bcc,
      reply_to: emailToSend.replyTo,
      subject: emailToSend.subject,
      text: emailToSend.text,
      html: emailToSend.html,
      headers: isNonEmptyArray(emailToSend.headers)
        ? Object.fromEntries(
            emailToSend.headers.map((header) => [header.name, header.value]),
          )
        : undefined,
      tags: [{ name: RESEND_WORKSPACE_TAG_NAME, value: input.workspaceId }],
      attachments: isNonEmptyArray(emailToSend.attachments)
        ? emailToSend.attachments.map((attachment) => ({
            filename: attachment.filename,
            content: attachment.content.toString('base64'),
            content_type: attachment.contentType,
          }))
        : undefined,
    };

    const { id } = await this.resendApiClientService.sendEmail(payload);

    this.logger.log(`Sent email ${id} from ${emailToSend.from} via Resend`);

    return {
      messageId: id,
      deliveredRecipients: {
        to: emailToSend.to,
        cc: emailToSend.cc ?? [],
        bcc: emailToSend.bcc ?? [],
      },
    };
  }

  private async findOrCreateDomain(domainName: string): Promise<ResendDomain> {
    const existingDomain = await this.findDomainByName(domainName);

    if (isDefined(existingDomain)) {
      return existingDomain;
    }

    return this.resendApiClientService.createDomain({
      name: domainName,
      ...(isNonEmptyString(this.config.domainRegion)
        ? { region: this.config.domainRegion }
        : {}),
    });
  }

  private async findDomainByName(
    domainName: string,
  ): Promise<ResendDomain | null> {
    const { data } = await this.resendApiClientService.listDomains();

    return (
      data.find(
        (domain) => domain.name.toLowerCase() === domainName.toLowerCase(),
      ) ?? null
    );
  }

  private toVerificationResult(
    domain: ResendDomain,
  ): EmailingDomainVerificationResult {
    return {
      status: mapResendDomainStatus(domain.status),
      verificationRecords: mapResendDomainRecords(domain.records),
    };
  }
}
