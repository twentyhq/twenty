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
import { DealLossIntelligenceService } from './deal-loss-intelligence.service';

import { MeetingBriefingEntity } from './meeting-briefing.entity';
import { MeetingBriefingService } from './meeting-briefing.service';

import { AutoEnrichmentEntity, EnrichmentLogEntity } from './auto-enrichment.entity';
import { AutoEnrichmentService } from './auto-enrichment.service';

import { ICPFitEntity, ICPCriteriaEntity } from './icp-fit.entity';
import { ICPFitService } from './icp-fit.service';

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
    DealLossIntelligenceService,
    MeetingBriefingService,
    AutoEnrichmentService,
    ICPFitService,
  ],
  exports: [
    PredictiveLeadScoringService,
    AIEmailWriterService,
    SentimentAnalysisService,
    NLPQueryService,
    NextBestActionService,
    DealLossIntelligenceService,
    MeetingBriefingService,
    AutoEnrichmentService,
    ICPFitService,
  ],
})
export class AiMLModule {}
