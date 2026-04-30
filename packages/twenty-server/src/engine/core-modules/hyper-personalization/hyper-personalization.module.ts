import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonalizationProfileEntity, PersonalizationRuleEntity, PersonalizationEventEntity } from './hyper-personalization.entity';
import { HyperPersonalizationService } from './hyper-personalization.service';
import { HyperPersonalizationResolver } from './hyper-personalization.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([PersonalizationProfileEntity, PersonalizationRuleEntity, PersonalizationEventEntity])],
  providers: [HyperPersonalizationService, HyperPersonalizationResolver],
  exports: [HyperPersonalizationService],
})
export class HyperPersonalizationModule {}
