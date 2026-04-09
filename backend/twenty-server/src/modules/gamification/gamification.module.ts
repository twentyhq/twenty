import { Module } from '@nestjs/common';

import { GamificationService } from 'src/modules/gamification/services/gamification.service';

@Module({
  providers: [GamificationService],
  exports: [GamificationService],
})
export class GamificationModule {}
