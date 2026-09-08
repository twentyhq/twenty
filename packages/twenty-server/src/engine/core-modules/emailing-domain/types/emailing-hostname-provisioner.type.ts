import { type VerificationRecord } from 'src/engine/core-modules/emailing-domain/drivers/types/verifications-record';
import { type EmailingDomainEntity } from 'src/engine/core-modules/emailing-domain/emailing-domain.entity';

export type EmailingHostnameProvisioner = {
  readonly hostnameKind: string;
  provision(emailingDomain: EmailingDomainEntity): Promise<void>;
  refreshStatus(emailingDomain: EmailingDomainEntity): Promise<void>;
  deprovision(emailingDomain: EmailingDomainEntity): Promise<void>;
  getDnsRecords(
    emailingDomain: EmailingDomainEntity,
  ): Promise<VerificationRecord[]>;
};
