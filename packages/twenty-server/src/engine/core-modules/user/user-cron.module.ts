import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserHardDeleteCronCommand } from 'src/engine/core-modules/user/commands/user-hard-delete.cron.command';
import { UserHardDeleteCronJob } from 'src/engine/core-modules/user/crons/user-hard-delete.cron.job';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  providers: [UserHardDeleteCronJob, UserHardDeleteCronCommand],
  exports: [UserHardDeleteCronCommand],
})
export class UserCronModule {}
