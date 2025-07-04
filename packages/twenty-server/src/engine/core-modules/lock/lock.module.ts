import { Module } from '@nestjs/common';

import { LockService } from 'src/engine/core-modules/lock/lock.service';

@Module({
  imports: [],
  providers: [LockService],
  exports: [LockService],
})
export class LockModule {}
