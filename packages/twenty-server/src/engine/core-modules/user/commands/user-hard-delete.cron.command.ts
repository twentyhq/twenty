import { InjectRepository } from '@nestjs/typeorm';

import { Command, CommandRunner } from 'nest-commander';
import { Repository } from 'typeorm';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { UserHardDeleteCronJob } from 'src/engine/core-modules/user/crons/user-hard-delete.cron.job';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';

const USER_HARD_DELETE_CRON_PATTERN = '0 3 * * *';

@Command({
  name: 'cron:user-hard-delete',
  description:
    'Starts a cron job to permanently delete users that were soft-deleted more than 30 days ago',
})
export class UserHardDeleteCronCommand extends CommandRunner {
  constructor(
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.addCron<undefined>({
      jobName: UserHardDeleteCronJob.name,
      data: undefined,
      options: {
        repeat: {
          pattern: USER_HARD_DELETE_CRON_PATTERN,
        },
      },
    });
  }
}
