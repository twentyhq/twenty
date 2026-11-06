import { Logger } from '@nestjs/common';

import { Command, CommandRunner, Option } from 'nest-commander';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';

const DEFAULT_GRACE_SECONDS = 10;

type JobMemoryReconcileCommandOptions = {
  graceSeconds?: number;
};

@Command({
  name: 'job-memory:reconcile',
  description:
    'Releases job memory charges and deletes stored job payloads whose BullMQ job is gone or finished',
})
export class JobMemoryReconcileCommand extends CommandRunner {
  private readonly logger = new Logger(JobMemoryReconcileCommand.name);

  constructor(
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  @Option({
    flags: '--grace-seconds <grace_seconds>',
    description: `Wait between the two reconcile passes (default ${DEFAULT_GRACE_SECONDS})`,
    required: false,
  })
  parseGraceSeconds(value: string): number {
    const graceSeconds = Number(value);

    if (!Number.isFinite(graceSeconds) || graceSeconds < 0) {
      throw new Error(
        `--grace-seconds must be a positive number, got ${value}`,
      );
    }

    return graceSeconds;
  }

  async run(
    _passedParams: string[],
    options: JobMemoryReconcileCommandOptions,
  ): Promise<void> {
    const graceSeconds = options.graceSeconds ?? DEFAULT_GRACE_SECONDS;
    // a charge or payload is only released when two passes miss its job, so one added just before BullMQ adds its job survives
    await this.reconcile();
    await new Promise((resolve) => setTimeout(resolve, graceSeconds * 1000));

    const [{ releasedCount, releasedBytes }, { deletedCount }] =
      await this.reconcile();

    this.logger.log(
      `Released ${releasedCount} job memory charges (${releasedBytes} bytes) and deleted ${deletedCount} orphaned job payloads`,
    );
  }

  private reconcile() {
    return Promise.all([
      this.messageQueueService.reconcileJobMemory(),
      this.messageQueueService.reconcileJobPayloads(),
    ]);
  }
}
