import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductUsageEventEntity, PQLScoreEntity, TrialConversionEntity, ProductAdoptionEntity } from './plg-intelligence.entity';
import { PLGIntelligenceService } from './plg-intelligence.service';
import { PLGIntelligenceResolver } from './plg-intelligence.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([ProductUsageEventEntity, PQLScoreEntity, TrialConversionEntity, ProductAdoptionEntity])],
  providers: [PLGIntelligenceService, PLGIntelligenceResolver],
  exports: [PLGIntelligenceService],
})
export class PLGIntelligenceModule {}
