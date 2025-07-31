import { InjectRepository } from '@nestjs/typeorm';

import { IsNull, Not, Repository, Raw } from 'typeorm';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { CustomDomainService } from 'src/engine/core-modules/domain-manager/services/custom-domain.service';
import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';

export const CHECK_CUSTOM_DOMAIN_VALID_RECORDS_CRON_PATTERN = '0 * * * *';

@Processor(MessageQueue.cronQueue)
export class CheckCustomDomainValidRecordsCronJob {
  constructor(
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    private readonly customDomainService: CustomDomainService,
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
        await this.customDomainService.checkCustomDomainValidRecords(workspace);
      } catch (error) {
        throw new Error(
          `[${CheckCustomDomainValidRecordsCronJob.name}] Cannot check custom domain for workspaces: ${error.message}`,
        );
      }
    }
  }
}
