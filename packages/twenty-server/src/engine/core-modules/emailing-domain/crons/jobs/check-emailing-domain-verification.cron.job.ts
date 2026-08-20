import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { In, Not, Repository } from 'typeorm';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { NON_TERMINAL_EMAILING_DOMAIN_STATUSES } from 'src/engine/core-modules/emailing-domain/constants/non-terminal-emailing-domain-statuses.constant';
import { UnsubscribeHostnameStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/unsubscribe-hostname-status.type';
import { EmailingDomainEntity } from 'src/engine/core-modules/emailing-domain/emailing-domain.entity';
import { EmailingDomainService } from 'src/engine/core-modules/emailing-domain/services/emailing-domain.service';
import { UnsubscribeHostnameService } from 'src/engine/core-modules/emailing-domain/services/unsubscribe-hostname.service';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

export const CHECK_EMAILING_DOMAIN_VERIFICATION_CRON_PATTERN = '0 * * * *';

@Processor(MessageQueue.cronQueue)
export class CheckEmailingDomainVerificationCronJob {
  private readonly logger = new Logger(
    CheckEmailingDomainVerificationCronJob.name,
  );

  constructor(
    @InjectRepository(EmailingDomainEntity)
    private readonly emailingDomainRepository: Repository<EmailingDomainEntity>,
    private readonly emailingDomainService: EmailingDomainService,
    private readonly unsubscribeHostnameService: UnsubscribeHostnameService,
  ) {}

  @Process(CheckEmailingDomainVerificationCronJob.name)
  @SentryCronMonitor(
    CheckEmailingDomainVerificationCronJob.name,
    CHECK_EMAILING_DOMAIN_VERIFICATION_CRON_PATTERN,
  )
  async handle(): Promise<void> {
    await this.refreshUnverifiedDomains();
    await this.refreshPendingUnsubscribeHostnames();
  }

  private async refreshUnverifiedDomains(): Promise<void> {
    const unverifiedDomains = await this.emailingDomainRepository.find({
      where: { status: In(NON_TERMINAL_EMAILING_DOMAIN_STATUSES) },
      select: ['id', 'workspaceId', 'domain'],
    });

    for (const emailingDomain of unverifiedDomains) {
      await this.emailingDomainService
        .verifyEmailingDomain({
          workspaceId: emailingDomain.workspaceId,
          emailingDomainId: emailingDomain.id,
        })
        .catch((error) => {
          this.logger.error(
            `[${CheckEmailingDomainVerificationCronJob.name}] Cannot verify emailing domain ${emailingDomain.domain} of workspace ${emailingDomain.workspaceId}: ${error}`,
          );
        });
    }
  }

  private async refreshPendingUnsubscribeHostnames(): Promise<void> {
    const verifiedDomainsWithPendingHostname =
      await this.emailingDomainRepository.find({
        where: {
          status: Not(In(NON_TERMINAL_EMAILING_DOMAIN_STATUSES)),
          unsubscribeHostnameStatus: UnsubscribeHostnameStatus.PENDING,
        },
        select: ['id', 'workspaceId'],
      });

    for (const emailingDomain of verifiedDomainsWithPendingHostname) {
      await this.unsubscribeHostnameService.sync(
        emailingDomain.workspaceId,
        emailingDomain.id,
        { provision: false },
      );
    }
  }
}
