import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Float } from '@nestjs/graphql';
import { Field, ObjectType, InputType } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { MarketingCampaignService } from './marketing-campaign.service';

// --- DTOs ---
@ObjectType()
class MarketingCampaignDTO {
  @Field() id: string;
  @Field({ nullable: true }) name?: string;
  @Field({ nullable: true }) status?: string;
  @Field({ nullable: true }) type?: string;
}

@ObjectType()
class LeadScoreDTO {
  @Field() id: string;
  @Field() contactId: string;
  @Field() totalScore: number;
  @Field({ nullable: true }) tier?: string;
  @Field({ nullable: true }) isMQL?: boolean;
  @Field({ nullable: true }) isSQL?: boolean;
}

@ObjectType()
class CampaignROIDTO {
  @Field(() => Float) cpl: number;
  @Field(() => Float) cpo: number;
  @Field(() => Float) roi: number;
}

@InputType()
class CreateCampaignInput {
  @Field() name: string;
  @Field({ nullable: true }) type?: string;
  @Field({ nullable: true }) channel?: string;
  @Field(() => Float, { nullable: true }) budget?: number;
}

// --- Resolver ---
@MetadataResolver()
@UseGuards(WorkspaceAuthGuard, UserAuthGuard)
export class MarketingCampaignResolver {
  constructor(private readonly service: MarketingCampaignService) {}

  @Mutation(() => MarketingCampaignDTO)
  async createCampaign(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: CreateCampaignInput,
  ) {
    return this.service.createCampaign(workspace.id, input);
  }

  @Mutation(() => MarketingCampaignDTO)
  async launchCampaign(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('campaignId') campaignId: string,
  ) {
    return this.service.launchCampaign(campaignId);
  }

  @Mutation(() => LeadScoreDTO)
  async processLeadAction(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('contactId') contactId: string,
    @Args('action') action: string,
  ) {
    return this.service.processLeadAction(workspace.id, contactId, action as any);
  }

  @Mutation(() => LeadScoreDTO)
  async handoffToSales(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('contactId') contactId: string,
  ) {
    return this.service.handoffToSales(workspace.id, contactId);
  }

  @Mutation(() => Boolean)
  async calculateMultiTouchAttribution(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('dealId') dealId: string,
    @Args('revenueAmount', { type: () => Float }) revenueAmount: number,
  ) {
    await this.service.calculateMultiTouchAttribution(workspace.id, dealId, revenueAmount);
    return true;
  }

  @Query(() => CampaignROIDTO)
  async getCampaignROI(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('campaignId') campaignId: string,
  ) {
    return this.service.getCampaignROI(campaignId);
  }
}
