import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaderboardEntryEntity, BadgeEntity, SalesChallengeEntity } from './gamification.entity';
import { GamificationService } from './gamification.service';
import { GamificationResolver } from './gamification.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([LeaderboardEntryEntity, BadgeEntity, SalesChallengeEntity])],
  providers: [GamificationService, GamificationResolver],
  exports: [GamificationService],
})
export class GamificationModule {}
