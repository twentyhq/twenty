import { Injectable, Logger } from '@nestjs/common';

import { v4 } from 'uuid';

import {
  type EmailingDomainDriverInterface,
  type EmailingDomainResourceInput,
  type EmailingDomainVerificationResult,
} from 'src/engine/core-modules/emailing-domain/drivers/interfaces/emailing-domain-driver.interface';
import { EmailingDomainStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-status.type';
import {
  type EmailingDomainSendEmailInput,
  type EmailingDomainSendEmailResult,
} from 'src/engine/core-modules/emailing-domain/drivers/types/send-email';

@Injectable()
export class LogEmailingDomainDriver implements EmailingDomainDriverInterface {
  private readonly logger = new Logger(LogEmailingDomainDriver.name);

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
      verificationRecords: [],
    };
  }

  async getDomainStatus(
    input: EmailingDomainResourceInput,
  ): Promise<EmailingDomainVerificationResult> {
    this.logger.log(`[log-driver] getDomainStatus(${input.domain}) → VERIFIED`);

    return {
      status: EmailingDomainStatus.VERIFIED,
      verificationRecords: [],
    };
  }

  async registerDomain(input: EmailingDomainResourceInput): Promise<void> {
    this.logger.log(`[log-driver] registerDomain(${input.domain})`);
  }

  async cleanupDomain(input: EmailingDomainResourceInput): Promise<void> {
    this.logger.log(`[log-driver] cleanupDomain(${input.domain})`);
  }

  async sendEmail(
    input: EmailingDomainSendEmailInput,
  ): Promise<EmailingDomainSendEmailResult> {
    const messageId = `log-${v4()}`;

    this.logger.log(
      `[log-driver] sendEmail from=${input.from} to=${input.to.join(',')} subject="${input.subject}" → fake messageId=${messageId}`,
    );

    return {
      messageId,
      deliveredRecipients: {
        to: input.to,
        cc: input.cc ?? [],
        bcc: input.bcc ?? [],
      },
    };
  }
}
