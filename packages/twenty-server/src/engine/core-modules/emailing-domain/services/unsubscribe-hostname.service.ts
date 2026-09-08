/* @license Enterprise */
import { Injectable } from '@nestjs/common';

import { ManagedHostnameStatus } from 'src/engine/core-modules/dns-manager/types/managed-hostname-status.type';
import { UNSUBSCRIBE_HOSTNAME_PREFIX } from 'src/engine/core-modules/emailing-domain/constants/unsubscribe-hostname-prefix.constant';
import { EmailingDomainEntity } from 'src/engine/core-modules/emailing-domain/emailing-domain.entity';
import { type EmailingHostnameProvisioner } from 'src/engine/core-modules/emailing-domain/types/emailing-hostname-provisioner.type';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

@Injectable()
export class UnsubscribeHostnameService implements EmailingHostnameProvisioner {
  readonly hostnameKind = 'unsubscribe';

  constructor(
    @InjectWorkspaceScopedRepository(EmailingDomainEntity)
    private readonly emailingDomainRepository: WorkspaceScopedRepository<EmailingDomainEntity>,
  ) {}

  readHostname(emailingDomain: EmailingDomainEntity): string | null {
    return emailingDomain.unsubscribeHostname;
  }

  readHostnameId(emailingDomain: EmailingDomainEntity): string | null {
    return emailingDomain.unsubscribeHostnameId;
  }

  async resolveDesiredHostname(
    emailingDomain: EmailingDomainEntity,
  ): Promise<string | null> {
    return `${UNSUBSCRIBE_HOSTNAME_PREFIX}.${emailingDomain.domain}`;
  }

  async persistProvisionedHostname({
    emailingDomain,
    hostname,
    hostnameId,
  }: {
    emailingDomain: EmailingDomainEntity;
    hostname: string;
    hostnameId: string;
  }): Promise<void> {
    await this.emailingDomainRepository.update(
      emailingDomain.workspaceId,
      { id: emailingDomain.id },
      {
        unsubscribeHostname: hostname,
        unsubscribeHostnameId: hostnameId,
        unsubscribeHostnameStatus: ManagedHostnameStatus.PENDING,
      },
    );
  }

  async persistStatus({
    emailingDomain,
    status,
  }: {
    emailingDomain: EmailingDomainEntity;
    status: ManagedHostnameStatus;
  }): Promise<void> {
    await this.emailingDomainRepository.update(
      emailingDomain.workspaceId,
      { id: emailingDomain.id },
      { unsubscribeHostnameStatus: status },
    );
  }

  async clearHostname(emailingDomain: EmailingDomainEntity): Promise<void> {
    await this.emailingDomainRepository.update(
      emailingDomain.workspaceId,
      { id: emailingDomain.id },
      {
        unsubscribeHostname: null,
        unsubscribeHostnameId: null,
        unsubscribeHostnameStatus: null,
      },
    );
  }
}
