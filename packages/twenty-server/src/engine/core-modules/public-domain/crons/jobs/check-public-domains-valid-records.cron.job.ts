import { InjectRepository } from '@nestjs/typeorm';

import { Repository, Raw } from 'typeorm';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { PublicDomainService } from 'src/engine/core-modules/public-domain/public-domain.service';
import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { PublicDomainEntity } from 'src/engine/core-modules/public-domain/public-domain.entity';

export const CHECK_PUBLIC_DOMAINS_VALID_RECORDS_CRON_PATTERN = '0 * * * *';

@Processor(MessageQueue.cronQueue)
export class CheckPublicDomainsValidRecordsCronJob {
  constructor(
    @InjectRepository(PublicDomainEntity)
    private readonly publicDomainRepository: Repository<PublicDomainEntity>,
    private readonly publicDomainService: PublicDomainService,
  ) {}

  @Process(CheckPublicDomainsValidRecordsCronJob.name)
  @SentryCronMonitor(
    CheckPublicDomainsValidRecordsCronJob.name,
    CHECK_PUBLIC_DOMAINS_VALID_RECORDS_CRON_PATTERN,
  )
  async handle(): Promise<void> {
    const publicDomains = await this.publicDomainRepository.find({
      where: {
        isValidated: false,
        createdAt: Raw(
          (alias) => `EXTRACT(HOUR FROM ${alias}) = EXTRACT(HOUR FROM NOW())`,
        ),
      },
    });

    for (const publicDomain of publicDomains) {
      try {
        await this.publicDomainService.checkPublicDomainValidRecords(
          publicDomain,
        );
      } catch (error) {
        throw new Error(
          `[${CheckPublicDomainsValidRecordsCronJob.name}] Cannot check public domain: ${error.message}`,
        );
      }
    }
  }
}
