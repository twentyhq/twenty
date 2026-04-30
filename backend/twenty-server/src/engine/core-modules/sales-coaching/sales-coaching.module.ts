import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoachingSessionEntity, CallReviewEntity, RepScorecardEntity, SkillGapEntity } from './sales-coaching.entity';
import { SalesCoachingService } from './sales-coaching.service';
import { SalesCoachingResolver } from './sales-coaching.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([CoachingSessionEntity, CallReviewEntity, RepScorecardEntity, SkillGapEntity])],
  providers: [SalesCoachingService, SalesCoachingResolver],
  exports: [SalesCoachingService],
})
export class SalesCoachingModule {}
