import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { USER_SESSION_CLEANUP_CRON_PATTERN } from 'src/engine/core-modules/user-session/constants/user-session-cleanup-cron-pattern.constant';
import { UserSessionEntity } from 'src/engine/core-modules/user-session/user-session.entity';

// Kept after ending so the sessions UI and audits can still show recent sessions.
const ENDED_SESSION_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

const DELETE_BATCH_SIZE = 10000;

@Injectable()
@Processor(MessageQueue.cronQueue)
export class UserSessionCleanupCronJob {
  private readonly logger = new Logger(UserSessionCleanupCronJob.name);

  constructor(
    @InjectRepository(UserSessionEntity)
    private readonly userSessionRepository: Repository<UserSessionEntity>,
  ) {}

  @Process(UserSessionCleanupCronJob.name)
  @SentryCronMonitor(
    UserSessionCleanupCronJob.name,
    USER_SESSION_CLEANUP_CRON_PATTERN,
  )
  async handle(): Promise<void> {
    const threshold = new Date(Date.now() - ENDED_SESSION_RETENTION_MS);

    const deletedSessionCount = await this.deleteInBatches(() =>
      this.userSessionRepository
        .createQueryBuilder()
        .delete()
        .where(
          `"id" IN (
            SELECT "id" FROM "core"."userSession"
            WHERE "expiresAt" < :threshold OR "revokedAt" < :threshold
            LIMIT :batchSize
          )`,
          { threshold, batchSize: DELETE_BATCH_SIZE },
        )
        .execute()
        .then((result) => result.affected ?? 0),
    );

    if (deletedSessionCount > 0) {
      this.logger.log(`Deleted ${deletedSessionCount} ended sessions`);
    }
  }

  private async deleteInBatches(
    deleteBatch: () => Promise<number>,
  ): Promise<number> {
    let totalDeleted = 0;
    let affected = 0;

    do {
      affected = await deleteBatch();
      totalDeleted += affected;
    } while (affected === DELETE_BATCH_SIZE);

    return totalDeleted;
  }
}
