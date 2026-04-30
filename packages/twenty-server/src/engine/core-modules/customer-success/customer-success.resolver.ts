import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Float, Int } from '@nestjs/graphql';
import { Field, ObjectType, InputType } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

import { CustomerSuccessService } from './health-score.service';

// --- DTOs ---
@ObjectType()
class HealthDTO {
  @Field() id: string;
  @Field() accountId: string;
  @Field(() => Int) healthScore: number;
  @Field() status: string;
  @Field(() => [String]) riskFactors: string[];
  @Field(() => [String]) recommendations: string[];
}

@ObjectType()
class NPSSurveyDTO {
  @Field() id: string;
  @Field() accountId: string;
  @Field(() => Int) score: number;
  @Field({ nullable: true }) feedback: string;
  @Field() responded: boolean;
}

@ObjectType()
class PlaybookDTO {
  @Field() id: string;
  @Field() name: string;
  @Field() status: string;
  @Field(() => Int) progress: number;
  @Field() createdAt: Date;
}

@ObjectType()
class QBRDTO {
  @Field() id: string;
  @Field() accountId: string;
  @Field() status: string;
  @Field() scheduledAt: Date;
  @Field(() => [String]) attendees: string[];
  @Field(() => [String]) actionItems: string[];
  @Field({ nullable: true }) summary: string;
}

@ObjectType()
class ExpansionRevenueDTO {
  @Field() id: string;
  @Field() accountId: string;
  @Field(() => Float) amount: number;
  @Field() type: string;
  @Field() status: string;
}

@ObjectType()
class ExpansionRevenueSummaryDTO {
  @Field(() => Float) totalAmount: number;
  @Field(() => Float) realizedAmount: number;
  @Field(() => Float) forecastedAmount: number;
  @Field(() => Int) recordCount: number;
}

@ObjectType()
class CustomerSuccessSummaryDTO {
  @Field(() => HealthDTO, { nullable: true }) health: HealthDTO;
  @Field(() => Int) playbookCount: number;
  @Field(() => Int) activePlaybookCount: number;
  @Field(() => Int) qbrCount: number;
  @Field(() => Int) upcomingQbrCount: number;
}

@InputType()
class ComputeHealthInput {
  @Field() accountId: string;
  @Field(() => Int, { nullable: true }) supportTickets?: number;
  @Field(() => Int, { nullable: true }) loginFrequency?: number;
  @Field(() => Int, { nullable: true }) npsScore?: number;
  @Field(() => Int, { nullable: true }) paymentFailed?: number;
  @Field(() => Int, { nullable: true }) contractRenewal?: number;
}

@InputType()
class CreatePlaybookInput {
  @Field() name: string;
  @Field({ nullable: true }) accountId?: string;
  @Field(() => [String], { nullable: true }) steps?: string[];
  @Field(() => [String], { nullable: true }) triggers?: string[];
}

@InputType()
class ScheduleQBRInput {
  @Field() accountId: string;
  @Field() scheduledAt: Date;
  @Field(() => [String], { nullable: true }) attendees?: string[];
  @Field(() => [String], { nullable: true }) actionItems?: string[];
}

@InputType()
class CompleteQBRInput {
  @Field() id: string;
  @Field() summary: string;
  @Field(() => [String], { nullable: true }) actionItems?: string[];
}

@InputType()
class TrackExpansionInput {
  @Field() accountId: string;
  @Field(() => Float) amount: number;
  @Field({ nullable: true }) type?: string;
  @Field({ nullable: true }) dealId?: string;
  @Field({ nullable: true }) notes?: string;
}

// --- Resolver ---
@MetadataResolver()
@UseGuards(WorkspaceAuthGuard, UserAuthGuard)
export class CustomerSuccessResolver {
  constructor(
    private readonly csService: CustomerSuccessService,
  ) {}

  @Query(() => HealthDTO, { nullable: true })
  async customerHealth(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('accountId') accountId: string,
  ) {
    return this.csService.getHealth(workspace.id, accountId);
  }

  @Mutation(() => HealthDTO)
  async computeCustomerHealth(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: ComputeHealthInput,
  ) {
    const metrics: Record<string, number> = {};
    if (input.supportTickets !== undefined) metrics.supportTickets = input.supportTickets;
    if (input.loginFrequency !== undefined) metrics.loginFrequency = input.loginFrequency;
    if (input.npsScore !== undefined) metrics.npsScore = input.npsScore;
    if (input.paymentFailed !== undefined) metrics.paymentFailed = input.paymentFailed;
    if (input.contractRenewal !== undefined) metrics.contractRenewal = input.contractRenewal;
    return this.csService.computeHealth(workspace.id, input.accountId, metrics);
  }

  @Mutation(() => NPSSurveyDTO)
  async sendNPSSurvey(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('accountId') accountId: string,
  ) {
    return this.csService.sendNPS(workspace.id, accountId);
  }

  @Mutation(() => NPSSurveyDTO)
  async recordNPSResponse(
    @Args('surveyId') surveyId: string,
    @Args('score', { type: () => Int }) score: number,
    @Args('feedback', { nullable: true }) feedback?: string,
  ) {
    return this.csService.recordNPS(surveyId, score, feedback);
  }

  // Playbooks
  @Query(() => [PlaybookDTO])
  async playbooks(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('accountId', { nullable: true }) accountId?: string,
  ) {
    return this.csService.listPlaybooks(workspace.id, accountId);
  }

  @Mutation(() => PlaybookDTO)
  async createPlaybook(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: CreatePlaybookInput,
  ) {
    return this.csService.createPlaybook(workspace.id, input as any);
  }

  @Mutation(() => PlaybookDTO)
  async completePlaybook(@Args('playbookId') playbookId: string) {
    return this.csService.completePlaybook(playbookId);
  }

  // QBRs
  @Query(() => [QBRDTO])
  async qbrs(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('accountId', { nullable: true }) accountId?: string,
  ) {
    return this.csService.listQBRs(workspace.id, accountId);
  }

  @Mutation(() => QBRDTO)
  async scheduleQBR(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: ScheduleQBRInput,
  ) {
    return this.csService.scheduleQBR(workspace.id, input.accountId, input.scheduledAt, input.attendees, input.actionItems);
  }

  @Mutation(() => QBRDTO)
  async completeQBR(@Args('input') input: CompleteQBRInput) {
    return this.csService.completeQBR(input.id, input.summary, input.actionItems);
  }

  // Expansion Revenue
  @Mutation(() => ExpansionRevenueDTO)
  async trackExpansionRevenue(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: TrackExpansionInput,
  ) {
    return this.csService.trackExpansionRevenue(
      workspace.id,
      input.accountId,
      input.amount,
      undefined,
      { dealId: input.dealId, notes: input.notes },
    );
  }

  @Query(() => ExpansionRevenueSummaryDTO)
  async expansionRevenueSummary(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('accountId', { nullable: true }) accountId?: string,
  ) {
    return this.csService.getExpansionRevenueSummary(workspace.id, accountId);
  }

  @Query(() => CustomerSuccessSummaryDTO)
  async customerSuccessSummary(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('accountId') accountId: string,
  ) {
    return this.csService.getCustomerSuccessSummary(workspace.id, accountId);
  }
}
