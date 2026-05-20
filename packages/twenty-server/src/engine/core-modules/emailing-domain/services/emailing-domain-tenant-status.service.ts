import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Not, Repository } from 'typeorm';

import { EmailingDomainTenantStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-tenant-status.type';
import { EmailingDomainEntity } from 'src/engine/core-modules/emailing-domain/emailing-domain.entity';

@Injectable()
export class EmailingDomainTenantStatusService {
  private readonly logger = new Logger(EmailingDomainTenantStatusService.name);

  constructor(
    @InjectRepository(EmailingDomainEntity)
    private readonly emailingDomainRepository: Repository<EmailingDomainEntity>,
  ) {}

  async setTenantStatusForWorkspace(
    workspaceId: string,
    tenantStatus: EmailingDomainTenantStatus,
  ): Promise<void> {
    const { affected } = await this.emailingDomainRepository.update(
      {
        workspaceId,
        tenantStatus: Not(EmailingDomainTenantStatus.PERMANENTLY_SUSPENDED),
      },
      { tenantStatus },
    );

    this.logger.log(
      `Workspace ${workspaceId}: ${affected ?? 0} domain(s) -> ${tenantStatus}`,
    );
  }
}
