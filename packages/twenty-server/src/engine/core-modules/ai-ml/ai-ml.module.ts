import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PredictiveLeadScoringEntity, LeadScorePredictionEntity } from './predictive-lead-scoring.entity';
import { PredictiveLeadScoringService } from './predictive-lead-scoring.service';

import { AIEmailWriterEntity, EmailGenerationLogEntity } from './ai-email-writer.entity';
import { AIEmailWriterService } from './ai-email-writer.service';

import { SentimentAnalysisEntity, SentimentAggregateEntity } from './sentiment-analysis.entity';
import { SentimentAnalysisService } from './sentiment-analysis.service';

import { NLPQueryConfigEntity, NLPQueryLogEntity } from './nlp-query.entity';
import { NLPQueryService } from './nlp-query.service';

import { NextBestActionConfigEntity, NextBestActionEntity, ActionOutcomeLogEntity } from './next-best-action.entity';
import { NextBestActionService } from './next-best-action.service';

import { DealLossIntelligenceEntity, DealLossAnalysisEntity } from './deal-loss-intelligence.entity';

import { MeetingBriefingEntity } from './meeting-briefing.entity';

import { AutoEnrichmentEntity, EnrichmentLogEntity } from './auto-enrichment.entity';

import { ICPFitEntity, ICPCriteriaEntity } from './icp-fit.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PredictiveLeadScoringEntity,
      LeadScorePredictionEntity,
      AIEmailWriterEntity,
      EmailGenerationLogEntity,
      SentimentAnalysisEntity,
      SentimentAggregateEntity,
      NLPQueryConfigEntity,
      NLPQueryLogEntity,
      NextBestActionConfigEntity,
      NextBestActionEntity,
      ActionOutcomeLogEntity,
      DealLossIntelligenceEntity,
      DealLossAnalysisEntity,
      MeetingBriefingEntity,
      AutoEnrichmentEntity,
      EnrichmentLogEntity,
      ICPFitEntity,
      ICPCriteriaEntity,
    ]),
  ],
  providers: [
    PredictiveLeadScoringService,
    AIEmailWriterService,
    SentimentAnalysisService,
    NLPQueryService,
    NextBestActionService,
  ],
  exports: [
    PredictiveLeadScoringService,
    AIEmailWriterService,
    SentimentAnalysisService,
    NLPQueryService,
    NextBestActionService,
  ],
})
export class AiMLModule {}