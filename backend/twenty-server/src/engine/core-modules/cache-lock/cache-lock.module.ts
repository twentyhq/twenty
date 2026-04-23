import { Module } from '@nestjs/common';

import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';

@Module({
  imports: [],
  providers: [CacheLockService],
  exports: [CacheLockService],
})
export class CacheLockModule {}
