import { Injectable, Logger } from '@nestjs/common';

import { Not } from 'typeorm';

import { EmailingDomainTenantStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-tenant-status.type';
import { EmailingDomainEntity } from 'src/engine/core-modules/emailing-domain/emailing-domain.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

@Injectable()
export class EmailingDomainTenantStatusService {
  private readonly logger = new Logger(EmailingDomainTenantStatusService.name);

  constructor(
    @InjectWorkspaceScopedRepository(EmailingDomainEntity)
    private readonly emailingDomainRepository: WorkspaceScopedRepository<EmailingDomainEntity>,
  ) {}

  async setTenantStatusForWorkspace(
    workspaceId: string,
    tenantStatus: EmailingDomainTenantStatus,
  ): Promise<void> {
    const { affected } = await this.emailingDomainRepository.update(
      workspaceId,
      {
        tenantStatus: Not(EmailingDomainTenantStatus.PERMANENTLY_SUSPENDED),
      },
      { tenantStatus },
    );

    this.logger.log(
      `Workspace ${workspaceId}: ${affected ?? 0} domain(s) -> ${tenantStatus}`,
    );
  }
}
