import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { In, LessThan, Repository } from 'typeorm';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';

const USER_HARD_DELETE_CRON_PATTERN = '0 3 * * *'; // daily at 3AM
const BATCH_SIZE = 500;
const RETENTION_DAYS = 30;

@Injectable()
@Processor(MessageQueue.cronQueue)
export class UserHardDeleteCronJob {
  private readonly logger = new Logger(UserHardDeleteCronJob.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  @Process(UserHardDeleteCronJob.name)
  @SentryCronMonitor(UserHardDeleteCronJob.name, USER_HARD_DELETE_CRON_PATTERN)
  async handle(): Promise<void> {
    const cutoff = new Date();

    cutoff.setDate(cutoff.getDate() - RETENTION_DAYS);

    const totalUsersToDelete = await this.userRepository.count({
      withDeleted: true,
      where: { deletedAt: LessThan(cutoff) },
    });

    const totalBatches = Math.ceil(totalUsersToDelete / BATCH_SIZE);

    let totalDeleted = 0;

    for (let batchNum = 0; batchNum < totalBatches; batchNum++) {
      const usersToDelete = await this.userRepository.find({
        select: ['id'],
        withDeleted: true,
        where: { deletedAt: LessThan(cutoff) },
        order: { deletedAt: 'ASC' },
        take: BATCH_SIZE,
        loadEagerRelations: false,
      });

      if (usersToDelete.length === 0) {
        break;
      }

      await this.userRepository.delete({
        id: In(usersToDelete.map((user) => user.id)),
      });

      totalDeleted += usersToDelete.length;
    }

    this.logger.log(
      `Hard-deleted ${totalDeleted} user(s) older than ${RETENTION_DAYS} days`,
    );
  }
}
