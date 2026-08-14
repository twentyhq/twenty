/* @license Enterprise */

import { Logger } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { isNonEmptyArray } from 'twenty-shared/utils';

import {
  EmailingDomainDriverException,
  EmailingDomainDriverExceptionCode,
} from 'src/engine/core-modules/emailing-domain/drivers/exceptions/emailing-domain-driver.exception';
import {
  type EmailingDomainDriverInterface,
  type EmailingDomainResourceInput,
  type EmailingDomainVerificationResult,
} from 'src/engine/core-modules/emailing-domain/drivers/interfaces/emailing-domain-driver.interface';
import { MAILGUN_WORKSPACE_VARIABLE_NAME } from 'src/engine/core-modules/emailing-domain/drivers/mailgun/constants/mailgun-workspace-variable-name.constant';
import { type MailgunApiClientService } from 'src/engine/core-modules/emailing-domain/drivers/mailgun/services/mailgun-api-client.service';
import { type MailgunDomainResponse } from 'src/engine/core-modules/emailing-domain/drivers/mailgun/types/mailgun-domain-response.type';
import { mapMailgunDnsRecords } from 'src/engine/core-modules/emailing-domain/drivers/mailgun/utils/map-mailgun-dns-records.util';
import { mapMailgunDomainState } from 'src/engine/core-modules/emailing-domain/drivers/mailgun/utils/map-mailgun-domain-state.util';
import { type EmailingDomainSendEmailRequest } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-send-email-input.type';
import { type EmailingDomainSendEmailResult } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-send-email-result.type';
import { getUnsubscribeBaseUrl } from 'src/engine/core-modules/emailing-domain/drivers/utils/get-unsubscribe-base-url.util';
import { type UnsubscribeContentService } from 'src/engine/core-modules/emailing-domain/services/unsubscribe-content.service';

export class MailgunDriver implements EmailingDomainDriverInterface {
  private readonly logger = new Logger(MailgunDriver.name);

  constructor(
    private readonly mailgunApiClientService: MailgunApiClientService,
    private readonly unsubscribeContentService: UnsubscribeContentService,
  ) {}

  // Mailgun has no per-workspace resources: reputation is per sending
  // domain and workspace attribution travels on each send as a variable.
  async provisionWorkspace(workspaceId: string): Promise<void> {
    this.logger.log(
      `No Mailgun resources to provision for workspace ${workspaceId}`,
    );
  }

  async deprovisionWorkspace(workspaceId: string): Promise<void> {
    this.logger.log(
      `No Mailgun resources to deprovision for workspace ${workspaceId}`,
    );
  }

  async registerDomain(_input: EmailingDomainResourceInput): Promise<void> {
    // Mailgun configures the return path with the sending DNS records
  }

  async verifyDomain(
    input: EmailingDomainResourceInput,
  ): Promise<EmailingDomainVerificationResult> {
    await this.ensureDomainExists(input.domain);

    const verifiedDomain = await this.mailgunApiClientService.verifyDomain(
      input.domain,
    );

    return this.toVerificationResult(verifiedDomain, input.domain);
  }

  async getDomainStatus(
    input: EmailingDomainResourceInput,
  ): Promise<EmailingDomainVerificationResult> {
    try {
      const domain = await this.mailgunApiClientService.getDomain(input.domain);

      return this.toVerificationResult(domain, input.domain);
    } catch (error) {
      if (this.isNotFoundError(error)) {
        return {
          status: mapMailgunDomainState(undefined),
          verificationRecords: [],
        };
      }
      throw error;
    }
  }

  async cleanupDomain(input: EmailingDomainResourceInput): Promise<void> {
    try {
      await this.mailgunApiClientService.deleteDomain(input.domain);
    } catch (error) {
      if (this.isNotFoundError(error)) {
        return;
      }
      throw error;
    }
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

    const form = new FormData();

    form.append('from', emailToSend.from);
    emailToSend.to.forEach((recipient) => form.append('to', recipient));
    emailToSend.cc?.forEach((recipient) => form.append('cc', recipient));
    emailToSend.bcc?.forEach((recipient) => form.append('bcc', recipient));
    form.append('subject', emailToSend.subject);
    form.append('text', emailToSend.text);

    if (isNonEmptyString(emailToSend.html)) {
      form.append('html', emailToSend.html);
    }

    if (isNonEmptyArray(emailToSend.replyTo)) {
      form.append('h:Reply-To', emailToSend.replyTo.join(', '));
    }

    emailToSend.headers?.forEach((header) =>
      form.append(`h:${header.name}`, header.value),
    );

    form.append(`v:${MAILGUN_WORKSPACE_VARIABLE_NAME}`, input.workspaceId);

    emailToSend.attachments?.forEach((attachment) =>
      form.append(
        'attachment',
        new Blob([new Uint8Array(attachment.content)], {
          type: attachment.contentType,
        }),
        attachment.filename,
      ),
    );

    const { id } = await this.mailgunApiClientService.sendMessage(
      input.domain,
      form,
    );

    if (!isNonEmptyString(id)) {
      throw new EmailingDomainDriverException(
        'Mailgun returned no message id',
        EmailingDomainDriverExceptionCode.UNKNOWN,
      );
    }

    // Mailgun wraps the id in angle brackets while its events carry the
    // bare message-id, so store the bare form for later correlation
    const messageId = id.replace(/^<|>$/g, '');

    this.logger.log(
      `Sent email ${messageId} from ${emailToSend.from} via Mailgun`,
    );

    return {
      messageId,
      deliveredRecipients: {
        to: emailToSend.to,
        cc: emailToSend.cc ?? [],
        bcc: emailToSend.bcc ?? [],
      },
    };
  }

  private async ensureDomainExists(domainName: string): Promise<void> {
    try {
      await this.mailgunApiClientService.getDomain(domainName);
    } catch (error) {
      if (!this.isNotFoundError(error)) {
        throw error;
      }
      await this.mailgunApiClientService.createDomain(domainName);
    }
  }

  private isNotFoundError(error: unknown): boolean {
    return (
      error instanceof EmailingDomainDriverException &&
      error.code === EmailingDomainDriverExceptionCode.NOT_FOUND
    );
  }

  private toVerificationResult(
    domain: MailgunDomainResponse,
    domainName: string,
  ): EmailingDomainVerificationResult {
    return {
      status: mapMailgunDomainState(domain.domain?.state),
      verificationRecords: mapMailgunDnsRecords(
        domain.sending_dns_records,
        domainName,
      ),
    };
  }
}
