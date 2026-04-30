import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Float, Int } from '@nestjs/graphql';
import { Field, ObjectType, InputType } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

import { PredictiveLeadScoringService } from './predictive-lead-scoring.service';
import { AIEmailWriterService } from './ai-email-writer.service';
import { SentimentAnalysisService } from './sentiment-analysis.service';
import { NLPQueryService } from './nlp-query.service';
import { NextBestActionService } from './next-best-action.service';
import { DealLossIntelligenceService } from './deal-loss-intelligence.service';
import { MeetingBriefingService } from './meeting-briefing.service';
import { AutoEnrichmentService } from './auto-enrichment.service';
import { ICPFitService } from './icp-fit.service';

// --- Lead Scoring DTOs ---
@ObjectType()
class LeadScoreModelDTO {
  @Field() id: string;
  @Field() name: string;
  @Field() status: string;
  @Field() modelType: string;
  @Field(() => Float, { nullable: true }) accuracy: number;
  @Field(() => Float, { nullable: true }) precision: number;
  @Field(() => Float, { nullable: true }) recall: number;
  @Field(() => [String], { nullable: true }) features: string[];
}

@ObjectType()
class LeadPredictionDTO {
  @Field() id: string;
  @Field() leadId: string;
  @Field(() => Int) score: number;
  @Field(() => Float) probability: number;
  @Field() tier: string;
  @Field(() => [String], { nullable: true }) recommendations: string[];
}

@InputType()
class CreateLeadScoreModelInput {
  @Field({ nullable: true }) name?: string;
  @Field({ nullable: true }) modelType?: string;
  @Field(() => [String], { nullable: true }) features?: string[];
  @Field(() => Float, { nullable: true }) confidenceThreshold?: number;
}

// --- Sentiment DTOs ---
@ObjectType()
class SentimentResultDTO {
  @Field() id: string;
  @Field() sentiment: string;
  @Field(() => Float) confidence: number;
  @Field({ nullable: true }) summary: string;
}

// --- Meeting Briefing DTOs ---
@ObjectType()
class MeetingBriefingDTO {
  @Field() id: string;
  @Field() meetingId: string;
  @Field({ nullable: true }) meetingTitle: string;
  @Field({ nullable: true }) summary: string;
  @Field() status: string;
}

@InputType()
class CreateBriefingInput {
  @Field() meetingId: string;
  @Field() userId: string;
  @Field({ nullable: true }) meetingTitle?: string;
  @Field({ nullable: true }) meetingWith?: string;
}

// --- ICP Fit DTOs ---
@ObjectType()
class ICPCriteriaDTO {
  @Field() id: string;
  @Field() name: string;
  @Field({ nullable: true }) description: string;
  @Field(() => Float) weight: number;
  @Field() enabled: boolean;
}

@InputType()
class CreateICPCriteriaInput {
  @Field() name: string;
  @Field({ nullable: true }) description?: string;
  @Field(() => Float, { nullable: true }) weight?: number;
  @Field({ nullable: true }) enabled?: boolean;
}

// --- Auto Enrichment DTOs ---
@ObjectType()
class EnrichmentConfigDTO {
  @Field() id: string;
  @Field() enabled: boolean;
  @Field() status: string;
  @Field(() => Int) recordsEnriched: number;
  @Field(() => Float) dataQualityScore: number;
}

// --- Deal Loss Intelligence DTOs ---
@ObjectType()
class DealHealthDTO {
  @Field() dealId: string;
  @Field() healthStatus: string;
  @Field(() => Int) healthScore: number;
  @Field(() => [String]) riskFactors: string[];
  @Field(() => [String]) recommendations: string[];
}

@InputType()
class AnalyzeDealInput {
  @Field() id: string;
  @Field() name: string;
  @Field(() => Float, { nullable: true }) amount?: number;
  @Field({ nullable: true }) stage?: string;
  @Field(() => [String], { nullable: true }) competitorMentions?: string[];
  @Field({ nullable: true }) activitySummary?: string;
  @Field(() => Int, { nullable: true }) daysSinceLastActivity?: number;
}

// --- Resolver ---
@MetadataResolver()
@UseGuards(WorkspaceAuthGuard, UserAuthGuard)
export class AiMLResolver {
  constructor(
    private readonly leadScoringService: PredictiveLeadScoringService,
    private readonly emailWriterService: AIEmailWriterService,
    private readonly sentimentService: SentimentAnalysisService,
    private readonly nlpService: NLPQueryService,
    private readonly nbaService: NextBestActionService,
    private readonly dealLossService: DealLossIntelligenceService,
    private readonly briefingService: MeetingBriefingService,
    private readonly enrichmentService: AutoEnrichmentService,
    private readonly icpFitService: ICPFitService,
  ) {}

  // ==================== Lead Scoring ====================

  @Query(() => [LeadScoreModelDTO])
  async leadScoreModels(@AuthWorkspace() workspace: WorkspaceEntity) {
    return this.leadScoringService.getModels(workspace.id);
  }

  @Query(() => LeadScoreModelDTO, { nullable: true })
  async activeLeadScoreModel(@AuthWorkspace() workspace: WorkspaceEntity) {
    return this.leadScoringService.getActiveModel(workspace.id);
  }

  @Mutation(() => LeadScoreModelDTO)
  async createLeadScoreModel(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: CreateLeadScoreModelInput,
  ) {
    return this.leadScoringService.createModel(workspace.id, input as any);
  }

  @Mutation(() => LeadScoreModelDTO)
  async trainLeadScoreModel(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('modelId') modelId: string,
  ) {
    return this.leadScoringService.trainModel(workspace.id, modelId);
  }

  @Mutation(() => LeadScoreModelDTO)
  async activateLeadScoreModel(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('modelId') modelId: string,
  ) {
    return this.leadScoringService.activateModel(workspace.id, modelId);
  }

  @Mutation(() => LeadScoreModelDTO)
  async deactivateLeadScoreModel(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('modelId') modelId: string,
  ) {
    return this.leadScoringService.deactivateModel(workspace.id, modelId);
  }

  @Mutation(() => Boolean)
  async deleteLeadScoreModel(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('modelId') modelId: string,
  ) {
    await this.leadScoringService.deleteModel(workspace.id, modelId);
    return true;
  }

  @Query(() => LeadPredictionDTO, { nullable: true })
  async leadPrediction(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('leadId') leadId: string,
  ) {
    return this.leadScoringService.getPrediction(workspace.id, leadId);
  }

  @Query(() => [LeadPredictionDTO])
  async leadPredictionHistory(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('leadId') leadId: string,
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
  ) {
    return this.leadScoringService.getPredictionHistory(workspace.id, leadId, limit);
  }

  @Mutation(() => Boolean)
  async recordLeadConversion(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('leadId') leadId: string,
  ) {
    await this.leadScoringService.recordConversion(workspace.id, leadId);
    return true;
  }

  // ==================== Sentiment Analysis ====================

  @Mutation(() => SentimentResultDTO)
  async analyzeSentiment(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('content') content: string,
    @Args('recordId', { nullable: true }) recordId?: string,
    @Args('recordType', { nullable: true }) recordType?: string,
  ) {
    return this.sentimentService.analyze(workspace.id, content, recordId, recordType);
  }

  // ==================== Meeting Briefing ====================

  @Mutation(() => MeetingBriefingDTO)
  async createMeetingBriefing(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: CreateBriefingInput,
  ) {
    return this.briefingService.createBriefing(workspace.id, input);
  }

  // ==================== ICP Fit ====================

  @Query(() => [ICPCriteriaDTO])
  async icpCriteria(@AuthWorkspace() workspace: WorkspaceEntity) {
    return this.icpFitService.listCriteria(workspace.id);
  }

  @Mutation(() => ICPCriteriaDTO)
  async createICPCriteria(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: CreateICPCriteriaInput,
  ) {
    return this.icpFitService.createCriteria(workspace.id, input);
  }

  // ==================== Auto Enrichment ====================

  @Query(() => EnrichmentConfigDTO)
  async enrichmentConfig(@AuthWorkspace() workspace: WorkspaceEntity) {
    return this.enrichmentService.getConfig(workspace.id);
  }

  // ==================== Deal Loss Intelligence ====================

  @Mutation(() => DealHealthDTO)
  async analyzeDealHealth(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: AnalyzeDealInput,
  ) {
    return this.dealLossService.analyzeDeal(workspace.id, input);
  }
}
