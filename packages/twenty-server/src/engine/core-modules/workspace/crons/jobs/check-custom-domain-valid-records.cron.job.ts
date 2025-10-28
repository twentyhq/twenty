import { InjectRepository } from '@nestjs/typeorm';

import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { IsNull, Not, Raw, Repository } from 'typeorm';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { CustomDomainManagerService } from 'src/engine/core-modules/domain/custom-domain-manager/services/custom-domain-manager.service';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

export const CHECK_CUSTOM_DOMAIN_VALID_RECORDS_CRON_PATTERN = '0 * * * *';

@Processor(MessageQueue.cronQueue)
export class CheckCustomDomainValidRecordsCronJob {
  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly customDomainManagerService: CustomDomainManagerService,
  ) {}

  @Process(CheckCustomDomainValidRecordsCronJob.name)
  @SentryCronMonitor(
    CheckCustomDomainValidRecordsCronJob.name,
    CHECK_CUSTOM_DOMAIN_VALID_RECORDS_CRON_PATTERN,
  )
  async handle(): Promise<void> {
    const workspaces = await this.workspaceRepository.find({
      where: {
        activationStatus: WorkspaceActivationStatus.ACTIVE,
        customDomain: Not(IsNull()),
        createdAt: Raw(
          (alias) => `EXTRACT(HOUR FROM ${alias}) = EXTRACT(HOUR FROM NOW())`,
        ),
      },
      select: ['id', 'customDomain', 'isCustomDomainEnabled'],
    });

    for (const workspace of workspaces) {
      try {
        await this.customDomainManagerService.checkCustomDomainValidRecords(
          workspace,
        );
      } catch (error) {
        throw new Error(
          `[${CheckCustomDomainValidRecordsCronJob.name}] Cannot check custom domain for workspaces: ${error.message}`,
        );
      }
    }
  }
}
