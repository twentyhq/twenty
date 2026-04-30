import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Float, Int } from '@nestjs/graphql';
import { Field, ObjectType, InputType } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';

import { SdrAgentService } from './sdr-agent/sdr-agent.service';
import { CsmAgentService } from './csm-agent/csm-agent.service';
import { DealQualificationAgentService } from './deal-qualification-agent/deal-qualification-agent.service';
import { CompetitiveIntelligenceAgentService } from './competitive-intelligence-agent/competitive-intelligence-agent.service';
import { DataHygieneAgentService } from './data-hygiene-agent/data-hygiene-agent.service';

// --- SDR DTOs ---
@ObjectType()
class SdrAgentDTO {
  @Field() id: string;
  @Field() workspaceId: string;
  @Field() name: string;
  @Field() status: string;
  @Field({ nullable: true }) icpCriteria: string;
  @Field(() => Int) dailyOutreachLimit: number;
  @Field(() => Int) qualifiedLeadsCount: number;
  @Field(() => Int) meetingsBookedCount: number;
  @Field({ nullable: true }) lastRunAt: Date;
  @Field() createdAt: Date;
}

@InputType()
class CreateSdrAgentInput {
  @Field() name: string;
  @Field({ nullable: true }) icpCriteria?: string;
  @Field(() => Int, { nullable: true }) dailyOutreachLimit?: number;
}

// --- CSM DTOs ---
@ObjectType()
class RetentionActionDTO {
  @Field() action: string;
  @Field() reason: string;
  @Field() urgency: string;
  @Field() channel: string;
  @Field(() => [String]) talkingPoints: string[];
}

@InputType()
class CustomerHealthInput {
  @Field() accountName: string;
  @Field(() => Float) healthScore: number;
  @Field(() => Float, { nullable: true }) npsScore?: number;
  @Field(() => Int, { nullable: true }) lastLoginDaysAgo?: number;
  @Field({ nullable: true }) contractEndDate?: string;
  @Field(() => Float, { nullable: true }) mrr?: number;
  @Field(() => Int, { nullable: true }) supportTicketsOpen?: number;
  @Field(() => Float, { nullable: true }) featureAdoptionPercent?: number;
}

// --- Deal Qualification DTOs ---
@ObjectType()
class DealQualificationDTO {
  @Field() id: string;
  @Field() dealId: string;
  @Field(() => Float) overallScore: number;
  @Field() qualificationLevel: string;
  @Field({ nullable: true }) recommendation: string;
  @Field(() => [String], { nullable: true }) suggestedQuestions: string[];
  @Field() createdAt: Date;
}

@InputType()
class QualifyDealInput {
  @Field() id: string;
  @Field() name: string;
  @Field(() => Float, { nullable: true }) amount?: number;
  @Field({ nullable: true }) companyName?: string;
  @Field({ nullable: true }) stage?: string;
  @Field({ nullable: true }) budgetConfirmed?: boolean;
  @Field({ nullable: true }) authorityConfirmed?: boolean;
  @Field({ nullable: true }) needConfirmed?: boolean;
  @Field({ nullable: true }) timelineConfirmed?: boolean;
}

// --- Battle Card DTOs ---
@ObjectType()
class BattleCardDTO {
  @Field(() => [String]) strengths: string[];
  @Field(() => [String]) weaknesses: string[];
  @Field(() => [String]) differentiators: string[];
  @Field(() => [String]) commonObjections: string[];
  @Field() winStrategy: string;
}

// --- Data Hygiene DTOs ---
@ObjectType()
class DataHygieneAgentDTO {
  @Field() id: string;
  @Field() workspaceId: string;
  @Field() name: string;
  @Field() status: string;
  @Field() duplicateDetectionEnabled: boolean;
  @Field() autoEnrichmentEnabled: boolean;
  @Field(() => Int) duplicatesDetectedCount: number;
  @Field(() => Int) recordsCleanedCount: number;
  @Field() createdAt: Date;
}

// --- Resolver ---
@MetadataResolver()
@UseGuards(WorkspaceAuthGuard, UserAuthGuard)
export class AiAgentsResolver {
  constructor(
    private readonly sdrAgentService: SdrAgentService,
    private readonly csmAgentService: CsmAgentService,
    private readonly dealQualificationAgentService: DealQualificationAgentService,
    private readonly competitiveIntelligenceAgentService: CompetitiveIntelligenceAgentService,
    private readonly dataHygieneAgentService: DataHygieneAgentService,
  ) {}

  // --- SDR Agent ---
  @Query(() => [SdrAgentDTO])
  async sdrAgents(@AuthWorkspace() workspace: WorkspaceEntity) {
    return this.sdrAgentService.findAll(workspace.id);
  }

  @Mutation(() => SdrAgentDTO)
  async createSdrAgent(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: CreateSdrAgentInput,
  ) {
    return this.sdrAgentService.create(input as any, workspace.id);
  }

  @Mutation(() => SdrAgentDTO)
  async startSdrAgent(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('id') id: string,
  ) {
    return this.sdrAgentService.start(id, workspace.id);
  }

  @Mutation(() => SdrAgentDTO)
  async pauseSdrAgent(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('id') id: string,
  ) {
    return this.sdrAgentService.pause(id, workspace.id);
  }

  // --- CSM Agent ---
  @Mutation(() => RetentionActionDTO)
  async suggestRetentionAction(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUser() user: UserEntity,
    @Args('input') input: CustomerHealthInput,
  ) {
    return this.csmAgentService.suggestRetentionAction(
      workspace.id,
      user.id,
      input,
    );
  }

  // --- Deal Qualification ---
  @Mutation(() => DealQualificationDTO)
  async qualifyDeal(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUser() user: UserEntity,
    @Args('input') input: QualifyDealInput,
  ) {
    return this.dealQualificationAgentService.qualifyDeal(
      workspace.id,
      input,
      undefined,
      user.id,
    );
  }

  // --- Competitive Intelligence ---
  @Mutation(() => BattleCardDTO)
  async generateBattleCard(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUser() user: UserEntity,
    @Args('agentId') agentId: string,
    @Args('competitorName') competitorName: string,
  ) {
    return this.competitiveIntelligenceAgentService.generateBattleCard(
      agentId,
      workspace.id,
      user.id,
      competitorName,
    );
  }

  // --- Data Hygiene ---
  @Query(() => [DataHygieneAgentDTO])
  async dataHygieneAgents(@AuthWorkspace() workspace: WorkspaceEntity) {
    return this.dataHygieneAgentService.findAll(workspace.id);
  }
}
