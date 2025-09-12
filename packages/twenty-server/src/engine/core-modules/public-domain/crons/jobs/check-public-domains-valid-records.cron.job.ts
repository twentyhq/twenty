import { InjectRepository } from '@nestjs/typeorm';

import { IsNull, Not, Repository, Raw } from 'typeorm';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { PublicDomainService } from 'src/engine/core-modules/public-domain/public-domain.service';
import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';

export const CHECK_PUBLIC_DOMAINS_VALID_RECORDS_CRON_PATTERN = '0 * * * *';

@Processor(MessageQueue.cronQueue)
export class CheckPublicDomainsValidRecordsCronJob {
  constructor(
    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,
    private readonly publicDomainService: PublicDomainService,
  ) {}

  @Process(CheckPublicDomainsValidRecordsCronJob.name)
  @SentryCronMonitor(
    CheckPublicDomainsValidRecordsCronJob.name,
    CHECK_PUBLIC_DOMAINS_VALID_RECORDS_CRON_PATTERN,
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
      select: ['id'],
    });

    for (const workspace of workspaces) {
      try {
        await this.publicDomainService.checkPublicDomainsValidRecords(
          workspace,
        );
      } catch (error) {
        throw new Error(
          `[${CheckPublicDomainsValidRecordsCronJob.name}] Cannot check public domains for workspaces: ${error.message}`,
        );
      }
    }
  }
}
