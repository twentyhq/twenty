import { InjectRepository } from '@nestjs/typeorm';

import { IsNull, Not, Repository } from 'typeorm';
import chunk from 'lodash.chunk';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { CustomDomainService } from 'src/engine/core-modules/domain-manager/services/custom-domain.service';
import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';

export const CHECK_CUSTOM_DOMAIN_VALID_RECORDS_CRON_PATTERN = '0 * * * *';

@Processor(MessageQueue.cronQueue)
@SentryCronMonitor(
  CheckCustomDomainValidRecordsCronJob.name,
  CHECK_CUSTOM_DOMAIN_VALID_RECORDS_CRON_PATTERN,
)
export class CheckCustomDomainValidRecordsCronJob {
  constructor(
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    private readonly customDomainService: CustomDomainService,
  ) {}

  @Process(CheckCustomDomainValidRecordsCronJob.name)
  async handle(): Promise<void> {
    const workspaces = await this.workspaceRepository.find({
      where: {
        activationStatus: WorkspaceActivationStatus.ACTIVE,
        customDomain: Not(IsNull()),
      },
      select: ['id', 'customDomain', 'isCustomDomainEnabled'],
    });

    const chunkItems = chunk(workspaces, 5);

    for (const chunkItem of chunkItems) {
      await Promise.all(
        chunkItem.map(async (workspace) => {
          try {
            await this.customDomainService.checkCustomDomainValidRecords(
              workspace,
            );
          } catch (error) {
            throw new Error(
              `[${CheckCustomDomainValidRecordsCronJob.name}] Cannot check custom domain for workspaces: ${error.message}`,
            );
          }
        }),
      );
    }
  }
}
