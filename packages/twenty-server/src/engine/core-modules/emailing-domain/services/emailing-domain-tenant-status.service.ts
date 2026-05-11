import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { type EmailingDomainTenantStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-tenant-status.type';
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
      { workspaceId },
      { tenantStatus },
    );

    this.logger.log(
      `Set tenantStatus=${tenantStatus} on ${affected ?? 0} emailing domain row(s) for workspace ${workspaceId}`,
    );
  }
}
