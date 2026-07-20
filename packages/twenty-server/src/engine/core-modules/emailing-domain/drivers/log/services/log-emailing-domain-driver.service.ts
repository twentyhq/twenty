import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';

import { UNSUBSCRIBE_HOSTNAME_PREFIX } from 'src/engine/core-modules/emailing-domain/constants/unsubscribe-hostname-prefix.constant';
import {
  type EmailingDomainDriverInterface,
  type EmailingDomainResourceInput,
  type EmailingDomainVerificationResult,
} from 'src/engine/core-modules/emailing-domain/drivers/interfaces/emailing-domain-driver.interface';
import { EmailingDomainStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-status.type';
import { type EmailingDomainSendEmailRequest } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-send-email-input.type';
import { type EmailingDomainSendEmailResult } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-send-email-result.type';
import { UnsubscribeContentService } from 'src/engine/core-modules/emailing-domain/services/unsubscribe-content.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

@Injectable()
export class LogEmailingDomainDriver implements EmailingDomainDriverInterface {
  private readonly logger = new Logger(LogEmailingDomainDriver.name);

  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly unsubscribeContentService: UnsubscribeContentService,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
  ) {}

  async provisionWorkspace(workspaceId: string): Promise<void> {
    this.logger.log(`[log-driver] provisionWorkspace(${workspaceId})`);
  }

  async deprovisionWorkspace(workspaceId: string): Promise<void> {
    this.logger.log(`[log-driver] deprovisionWorkspace(${workspaceId})`);
  }

  async verifyDomain(
    input: EmailingDomainResourceInput,
  ): Promise<EmailingDomainVerificationResult> {
    this.logger.log(
      `[log-driver] verifyDomain(${input.domain}) → VERIFIED (instant)`,
    );

    return {
      status: EmailingDomainStatus.VERIFIED,
      verificationRecords: this.buildSyntheticVerificationRecords(input.domain),
    };
  }

  async getDomainStatus(
    input: EmailingDomainResourceInput,
  ): Promise<EmailingDomainVerificationResult> {
    this.logger.log(`[log-driver] getDomainStatus(${input.domain}) → VERIFIED`);

    return {
      status: EmailingDomainStatus.VERIFIED,
      verificationRecords: this.buildSyntheticVerificationRecords(input.domain),
    };
  }

  private buildSyntheticVerificationRecords(
    domain: string,
  ): EmailingDomainVerificationResult['verificationRecords'] {
    return [
      {
        type: 'CNAME',
        key: `synthetic1._domainkey.${domain}`,
        value: `synthetic1.dkim.amazonses.example`,
        status: 'success',
      },
      {
        type: 'CNAME',
        key: `synthetic2._domainkey.${domain}`,
        value: `synthetic2.dkim.amazonses.example`,
        status: 'success',
      },
      {
        type: 'CNAME',
        key: `synthetic3._domainkey.${domain}`,
        value: `synthetic3.dkim.amazonses.example`,
        status: 'pending',
      },
      {
        type: 'CNAME',
        key: `${UNSUBSCRIBE_HOSTNAME_PREFIX}.${domain}`,
        value: `app.localhost`,
        status: 'pending',
      },
      {
        type: 'CNAME',
        key: `_acme-challenge.${UNSUBSCRIBE_HOSTNAME_PREFIX}.${domain}`,
        value: `${domain}.dcv.cloudflare.example`,
        status: 'error',
      },
    ];
  }

  async registerDomain(input: EmailingDomainResourceInput): Promise<void> {
    this.logger.log(`[log-driver] registerDomain(${input.domain})`);
  }

  async cleanupDomain(input: EmailingDomainResourceInput): Promise<void> {
    this.logger.log(`[log-driver] cleanupDomain(${input.domain})`);
  }

  async sendEmail(
    input: EmailingDomainSendEmailRequest,
  ): Promise<EmailingDomainSendEmailResult> {
    const unsubscribeBaseUrl = await this.getUnsubscribeBaseUrl(
      input.workspaceId,
    );
    const emailToSend = this.unsubscribeContentService.addTo(
      input,
      unsubscribeBaseUrl,
    );

    const messageId = `log-${v4()}`;

    const listUnsubscribe = emailToSend.headers?.find(
      (header) => header.name === 'List-Unsubscribe',
    )?.value;

    this.logger.log(
      `[log-driver] sendEmail → fake messageId=${messageId}\n` +
        `From: ${emailToSend.from}\n` +
        `To: ${emailToSend.to.join(',')}\n` +
        `Subject: ${emailToSend.subject}\n` +
        `List-Unsubscribe: ${listUnsubscribe ?? '(none)'}\n` +
        `Content Text: ${emailToSend.text}\n` +
        `Content HTML: ${emailToSend.html ?? '(none)'}`,
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

  private async getUnsubscribeBaseUrl(
    workspaceId: string,
  ): Promise<string | null> {
    const workspace = await this.workspaceRepository.findOneBy({
      id: workspaceId,
    });

    if (!isNonEmptyString(workspace?.subdomain)) {
      return null;
    }

    const baseUrl = new URL(this.twentyConfigService.get('SERVER_URL'));

    baseUrl.hostname = this.twentyConfigService.get('IS_MULTIWORKSPACE_ENABLED')
      ? `${UNSUBSCRIBE_HOSTNAME_PREFIX}.${workspace.subdomain}.${baseUrl.hostname}`
      : `${UNSUBSCRIBE_HOSTNAME_PREFIX}.${baseUrl.hostname}`;

    return baseUrl.origin;
  }
}
