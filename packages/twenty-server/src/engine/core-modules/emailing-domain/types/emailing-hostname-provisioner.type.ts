import { type ManagedHostnameStatus } from 'src/engine/core-modules/dns-manager/types/managed-hostname-status.type';
import { type EmailingDomainEntity } from 'src/engine/core-modules/emailing-domain/emailing-domain.entity';

export type EmailingHostnameProvisioner = {
  readonly hostnameKind: string;
  readHostname(emailingDomain: EmailingDomainEntity): string | null;
  readHostnameId(emailingDomain: EmailingDomainEntity): string | null;
  resolveDesiredHostname(
    emailingDomain: EmailingDomainEntity,
  ): Promise<string | null>;
  persistProvisionedHostname(args: {
    emailingDomain: EmailingDomainEntity;
    hostname: string;
    hostnameId: string;
  }): Promise<void>;
  persistStatus(args: {
    emailingDomain: EmailingDomainEntity;
    status: ManagedHostnameStatus;
  }): Promise<void>;
  clearHostname(emailingDomain: EmailingDomainEntity): Promise<void>;
};
