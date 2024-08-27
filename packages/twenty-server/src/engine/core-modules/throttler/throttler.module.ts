import { Module } from '@nestjs/common';

import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';

@Module({
  imports: [],
  providers: [ThrottlerService],
  exports: [ThrottlerService],
})
export class ThrottlerModule {}
