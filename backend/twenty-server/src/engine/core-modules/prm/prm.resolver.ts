import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Float, Int } from '@nestjs/graphql';
import { Field, ObjectType, InputType } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { PRMService } from './prm.service';

// --- DTOs ---
@ObjectType()
class PartnerDTO {
  @Field() id: string;
  @Field({ nullable: true }) companyName?: string;
  @Field({ nullable: true }) status?: string;
  @Field({ nullable: true }) tier?: string;
  @Field(() => Float, { nullable: true }) totalRevenue?: number;
  @Field(() => Int, { nullable: true }) wonDeals?: number;
  @Field(() => Int, { nullable: true }) healthScore?: number;
}

@ObjectType()
class DealRegistrationDTO {
  @Field() id: string;
  @Field({ nullable: true }) status?: string;
  @Field({ nullable: true }) prospectCompanyName?: string;
  @Field(() => Float, { nullable: true }) estimatedValue?: number;
}

@ObjectType()
class MDFRequestDTO {
  @Field() id: string;
  @Field({ nullable: true }) status?: string;
  @Field(() => Float, { nullable: true }) amountRequested?: number;
  @Field(() => Float, { nullable: true }) amountApproved?: number;
}

@ObjectType()
class ChannelAnalyticsByTierDTO {
  @Field() tier: string;
  @Field(() => Int) count: number;
  @Field(() => Float) revenue: number;
}

@ObjectType()
class TopPartnerDTO {
  @Field() id: string;
  @Field() name: string;
  @Field(() => Float) revenue: number;
  @Field(() => Int) deals: number;
}

@ObjectType()
class ChannelAnalyticsDTO {
  @Field(() => Int) totalPartners: number;
  @Field(() => Int) activePartners: number;
  @Field(() => Float) channelRevenue: number;
  @Field(() => Float) avgDealSize: number;
  @Field(() => Int) mdfROI: number;
  @Field(() => [TopPartnerDTO]) topPartners: TopPartnerDTO[];
}

@ObjectType()
class PartnerLeaderboardEntryDTO {
  @Field(() => Int) rank: number;
  @Field() partnerId: string;
  @Field() name: string;
  @Field() tier: string;
  @Field(() => Int) points: number;
  @Field(() => Int) deals: number;
  @Field(() => [String]) badges: string[];
}

@InputType()
class RecruitPartnerInput {
  @Field() companyName: string;
  @Field({ nullable: true }) contactEmail?: string;
  @Field({ nullable: true }) contactName?: string;
}

@InputType()
class RegisterDealInput {
  @Field() prospectCompanyName: string;
  @Field(() => Float, { nullable: true }) estimatedValue?: number;
  @Field({ nullable: true }) description?: string;
  @Field(() => Int, { nullable: true }) exclusivityDays?: number;
}

@InputType()
class RequestMDFInput {
  @Field({ nullable: true }) activityName?: string;
  @Field(() => Float, { nullable: true }) amountRequested?: number;
  @Field({ nullable: true }) description?: string;
}

// --- Resolver ---
@MetadataResolver()
@UseGuards(WorkspaceAuthGuard, UserAuthGuard)
export class PRMResolver {
  constructor(private readonly service: PRMService) {}

  @Mutation(() => PartnerDTO)
  async recruitPartner(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: RecruitPartnerInput,
  ) {
    return this.service.recruitPartner(workspace.id, input);
  }

  @Mutation(() => PartnerDTO)
  async onboardPartner(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('partnerId') partnerId: string,
  ) {
    return this.service.onboardPartner(partnerId);
  }

  @Mutation(() => PartnerDTO)
  async activatePartner(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('partnerId') partnerId: string,
    @Args('tier') tier: string,
  ) {
    return this.service.activatePartner(partnerId, tier as any);
  }

  @Mutation(() => DealRegistrationDTO)
  async registerDeal(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('partnerId') partnerId: string,
    @Args('input') input: RegisterDealInput,
  ) {
    return this.service.registerDeal(workspace.id, partnerId, input);
  }

  @Mutation(() => DealRegistrationDTO)
  async approveDealRegistration(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('regId') regId: string,
    @Args('approverId') approverId: string,
  ) {
    return this.service.approveDealRegistration(regId, approverId);
  }

  @Mutation(() => MDFRequestDTO)
  async requestMDF(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('partnerId') partnerId: string,
    @Args('input') input: RequestMDFInput,
  ) {
    return this.service.requestMDF(workspace.id, partnerId, input);
  }

  @Query(() => ChannelAnalyticsDTO)
  async getChannelAnalytics(@AuthWorkspace() workspace: WorkspaceEntity) {
    return this.service.getChannelAnalytics(workspace.id);
  }

  @Query(() => [PartnerLeaderboardEntryDTO])
  async getPartnerLeaderboard(@AuthWorkspace() workspace: WorkspaceEntity) {
    return this.service.getPartnerLeaderboard(workspace.id);
  }
}
