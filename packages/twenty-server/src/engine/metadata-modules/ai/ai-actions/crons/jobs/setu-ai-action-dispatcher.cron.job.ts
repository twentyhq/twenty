import { Injectable } from '@nestjs/common';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { SETU_AI_ACTION_DISPATCHER_CRON_PATTERN } from 'src/engine/metadata-modules/ai/ai-actions/constants/setu-ai-action-dispatcher-cron-pattern.constant';
import { SetuAiActionDispatcherService } from 'src/engine/metadata-modules/ai/ai-actions/services/setu-ai-action-dispatcher.service';

@Injectable()
@Processor(MessageQueue.cronQueue)
export class SetuAiActionDispatcherCronJob {
  constructor(
    private readonly dispatcherService: SetuAiActionDispatcherService,
  ) {}

  @Process(SetuAiActionDispatcherCronJob.name)
  @SentryCronMonitor(
    SetuAiActionDispatcherCronJob.name,
    SETU_AI_ACTION_DISPATCHER_CRON_PATTERN,
  )
  async handle(): Promise<void> {
    await this.dispatcherService.dispatch();
  }
}
