/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { ENTERPRISE_KEY_VALIDATION_CRON_PATTERN } from 'src/engine/core-modules/enterprise/constants/enterprise-key-validation-cron-pattern.constant';
import { EnterprisePlanService } from 'src/engine/core-modules/enterprise/services/enterprise-plan.service';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

@Injectable()
@Processor(MessageQueue.cronQueue)
export class EnterpriseKeyValidationCronJob {
  private readonly logger = new Logger(EnterpriseKeyValidationCronJob.name);

  constructor(private readonly enterprisePlanService: EnterprisePlanService) {}

  @Process(EnterpriseKeyValidationCronJob.name)
  @SentryCronMonitor(
    EnterpriseKeyValidationCronJob.name,
    ENTERPRISE_KEY_VALIDATION_CRON_PATTERN,
  )
  async handle(): Promise<void> {
    this.logger.log(
      'Starting enterprise validity token refresh and seat report...',
    );

    try {
      const refreshSuccess =
        await this.enterprisePlanService.refreshValidityToken();

      if (refreshSuccess) {
        this.logger.log('Enterprise validity token refreshed successfully');
      } else {
        this.logger.warn(
          'Enterprise validity token refresh did not succeed. ' +
            'Existing validity token will continue to work until expiration.',
        );
      }
    } catch (error) {
      this.logger.warn(
        `Enterprise validity token refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}. ` +
          'Existing validity token will continue to work until expiration.',
      );
    }

    try {
      const seatCount = await this.enterprisePlanService.getBillableSeatCount();

      const reportSuccess =
        await this.enterprisePlanService.reportSeats(seatCount);

      if (reportSuccess) {
        this.logger.log(`Reported ${seatCount} seats to enterprise API`);
      } else {
        this.logger.warn('Seat report did not succeed');
      }
    } catch (error) {
      this.logger.warn(
        `Failed to get seat count or report: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
