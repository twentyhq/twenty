import { CHECK_EMAILING_DOMAIN_VERIFICATION_CRON_PATTERN } from 'src/engine/core-modules/emailing-domain/constants/check-emailing-domain-verification-cron-pattern.constant';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { IsNull, Not, Or, Raw, Repository } from 'typeorm';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { EMAILING_DOMAIN_HOURLY_CHECK_PERIOD } from 'src/engine/core-modules/emailing-domain/constants/emailing-domain-hourly-check-period.constant';
import { EmailingDomainDriverFactory } from 'src/engine/core-modules/emailing-domain/drivers/emailing-domain-driver.factory';
import { EmailingDomainStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-status.type';
import { UnsubscribeHostnameStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/unsubscribe-hostname-status.type';
import { EmailingDomainEntity } from 'src/engine/core-modules/emailing-domain/emailing-domain.entity';
import { EmailingDomainService } from 'src/engine/core-modules/emailing-domain/services/emailing-domain.service';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

@Processor(MessageQueue.cronQueue)
export class CheckEmailingDomainVerificationCronJob {
  private readonly logger = new Logger(
    CheckEmailingDomainVerificationCronJob.name,
  );

  constructor(
    // Instance-wide sweep: it enumerates domains across all workspaces and
    // dispatches per-workspace work from what it finds.
    // eslint-disable-next-line twenty/prefer-workspace-scoped-repository
    @InjectRepository(EmailingDomainEntity)
    private readonly emailingDomainRepository: Repository<EmailingDomainEntity>,
    private readonly emailingDomainService: EmailingDomainService,
    private readonly emailingDomainDriverFactory: EmailingDomainDriverFactory,
  ) {}

  @Process(CheckEmailingDomainVerificationCronJob.name)
  @SentryCronMonitor(
    CheckEmailingDomainVerificationCronJob.name,
    CHECK_EMAILING_DOMAIN_VERIFICATION_CRON_PATTERN,
  )
  async handle(): Promise<void> {
    await this.refreshIncompleteDomains();
    await this.reprovisionWorkspacesOfTheHour();
  }

  private async reprovisionWorkspacesOfTheHour(): Promise<void> {
    const emailingDomainsOfTheHour = await this.emailingDomainRepository.find({
      where: {
        createdAt: Raw(
          (alias) => `EXTRACT(HOUR FROM ${alias}) = EXTRACT(HOUR FROM NOW())`,
        ),
      },
      select: ['workspaceId'],
    });

    const workspaceIds = new Set(
      emailingDomainsOfTheHour.map(
        (emailingDomain) => emailingDomain.workspaceId,
      ),
    );

    for (const workspaceId of workspaceIds) {
      await this.emailingDomainDriverFactory
        .getCurrentDriver()
        .provisionWorkspace(workspaceId)
        .catch((error) => {
          this.logger.error(
            `[${CheckEmailingDomainVerificationCronJob.name}] Cannot reprovision emailing resources for workspace ${workspaceId}: ${error}`,
          );
        });
    }
  }

  private async refreshIncompleteDomains(): Promise<void> {
    const isDueThisRun = Raw(
      (alias) =>
        `(${alias} > NOW() - INTERVAL '${EMAILING_DOMAIN_HOURLY_CHECK_PERIOD}' OR EXTRACT(HOUR FROM ${alias}) = EXTRACT(HOUR FROM NOW()))`,
    );

    const incompleteDomains = await this.emailingDomainRepository.find({
      where: [
        {
          status: Not(EmailingDomainStatus.VERIFIED),
          createdAt: isDueThisRun,
        },
        {
          unsubscribeHostnameStatus: Or(
            IsNull(),
            Not(UnsubscribeHostnameStatus.ACTIVE),
          ),
          createdAt: isDueThisRun,
        },
      ],
      select: ['id', 'workspaceId', 'domain'],
    });

    for (const emailingDomain of incompleteDomains) {
      await this.emailingDomainService
        .refreshEmailingDomain({
          workspaceId: emailingDomain.workspaceId,
          emailingDomainId: emailingDomain.id,
          isUserTriggered: false,
        })
        .catch((error) => {
          this.logger.error(
            `[${CheckEmailingDomainVerificationCronJob.name}] Cannot verify emailing domain ${emailingDomain.domain} of workspace ${emailingDomain.workspaceId}: ${error}`,
          );
        });
    }
  }
}
