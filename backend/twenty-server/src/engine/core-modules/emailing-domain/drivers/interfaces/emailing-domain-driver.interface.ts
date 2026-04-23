import { type EmailingDomainStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain';
import { type VerificationRecord } from 'src/engine/core-modules/emailing-domain/drivers/types/verifications-record';

export type DomainVerificationInput = {
  domain: string;
  workspaceId: string;
};

export type DomainStatusInput = {
  domain: string;
  workspaceId: string;
};

export type EmailingDomainVerificationResult = {
  status: EmailingDomainStatus;
  verificationRecords: VerificationRecord[];
  verifiedAt: Date | null;
};

export interface EmailingDomainDriverInterface {
  verifyDomain(
    input: DomainVerificationInput,
  ): Promise<EmailingDomainVerificationResult>;
  getDomainStatus(
    input: DomainStatusInput,
  ): Promise<EmailingDomainVerificationResult>;
}
