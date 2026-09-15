import { Injectable, Logger } from '@nestjs/common';

import { CodeInterpreterService } from 'src/engine/core-modules/code-interpreter/code-interpreter.service';
import { CODE_INTERPRETER_SESSION_CLEANUP_CRON_PATTERN } from 'src/engine/core-modules/code-interpreter/constants/code-interpreter-session-cleanup-cron-pattern.constant';
import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

@Injectable()
@Processor(MessageQueue.cronQueue)
export class CodeInterpreterSessionCleanupCronJob {
  private readonly logger = new Logger(
    CodeInterpreterSessionCleanupCronJob.name,
  );

  constructor(
    private readonly codeInterpreterService: CodeInterpreterService,
  ) {}

  @Process(CodeInterpreterSessionCleanupCronJob.name)
  @SentryCronMonitor(
    CodeInterpreterSessionCleanupCronJob.name,
    CODE_INTERPRETER_SESSION_CLEANUP_CRON_PATTERN,
  )
  async handle(): Promise<void> {
    const reclaimedCount =
      await this.codeInterpreterService.sweepExpiredSandboxes();

    if (reclaimedCount > 0) {
      this.logger.log(
        `Reclaimed ${reclaimedCount} expired code interpreter sandbox(es)`,
      );
    }
  }
}
