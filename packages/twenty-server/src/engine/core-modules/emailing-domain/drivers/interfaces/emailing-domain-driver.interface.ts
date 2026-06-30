import { type EmailingDomainSendEmailInput } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-send-email-input.type';
import { type EmailingDomainSendEmailResult } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-send-email-result.type';
import { type EmailingDomainStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-status.type';
import { type VerificationRecord } from 'src/engine/core-modules/emailing-domain/drivers/types/verifications-record';

export type EmailingDomainResourceInput = {
  domain: string;
  workspaceId: string;
};

export type EmailingDomainVerificationResult = {
  status: EmailingDomainStatus;
  verificationRecords: VerificationRecord[];
};

export interface EmailingDomainDriverInterface {
  provisionWorkspace(workspaceId: string): Promise<void>;
  deprovisionWorkspace(workspaceId: string): Promise<void>;
  verifyDomain(
    input: EmailingDomainResourceInput,
  ): Promise<EmailingDomainVerificationResult>;
  getDomainStatus(
    input: EmailingDomainResourceInput,
  ): Promise<EmailingDomainVerificationResult>;
  registerDomain(input: EmailingDomainResourceInput): Promise<void>;
  cleanupDomain(input: EmailingDomainResourceInput): Promise<void>;
  sendEmail(
    input: EmailingDomainSendEmailInput,
  ): Promise<EmailingDomainSendEmailResult>;
}
