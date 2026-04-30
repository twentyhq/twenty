import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Float, Int } from '@nestjs/graphql';
import { Field, ObjectType, InputType } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { HyperPersonalizationService } from './hyper-personalization.service';

@ObjectType()
class PersonalizationProfileDTO {
  @Field() id: string;
  @Field({ nullable: true }) contactId?: string;
  @Field({ nullable: true }) segment?: string;
  @Field(() => Float, { nullable: true }) engagementScore?: number;
  @Field(() => Int, { nullable: true }) totalInteractions?: number;
}

@ObjectType()
class PersonalizationRuleDTO {
  @Field() id: string;
  @Field({ nullable: true }) name?: string;
  @Field({ nullable: true }) isActive?: boolean;
  @Field(() => Int, { nullable: true }) impressions?: number;
  @Field(() => Int, { nullable: true }) conversions?: number;
}

@ObjectType()
class PersonalizationEventDTO {
  @Field() id: string;
  @Field({ nullable: true }) contactId?: string;
  @Field({ nullable: true }) eventType?: string;
  @Field({ nullable: true }) eventName?: string;
}

@ObjectType()
class PersonalizedContentDTO {
  @Field() profileId: string;
  @Field() segment: string;
}

@ObjectType()
class SegmentRecommendationDTO {
  @Field() segment: string;
  @Field(() => Int) contactCount: number;
  @Field(() => Float) avgEngagement: number;
  @Field(() => [String]) topInterests: string[];
}

@InputType()
class CreateProfileInput {
  @Field() contactId: string;
  @Field({ nullable: true }) segment?: string;
  @Field({ nullable: true }) preferredLanguage?: string;
}

@InputType()
class AddRuleInput {
  @Field() name: string;
  @Field() targetField: string;
  @Field({ nullable: true }) operator?: string;
  @Field() value: string;
  @Field({ nullable: true }) channel?: string;
}

@InputType()
class TrackEventInput {
  @Field() contactId: string;
  @Field({ nullable: true }) eventType?: string;
  @Field({ nullable: true }) eventName?: string;
  @Field({ nullable: true }) pageUrl?: string;
}

@MetadataResolver()
@UseGuards(WorkspaceAuthGuard, UserAuthGuard)
export class HyperPersonalizationResolver {
  constructor(private readonly service: HyperPersonalizationService) {}

  @Mutation(() => PersonalizationProfileDTO)
  async createPersonalizationProfile(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: CreateProfileInput,
  ) {
    return this.service.createProfile(workspace.id, input);
  }

  @Mutation(() => PersonalizationRuleDTO)
  async addPersonalizationRule(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: AddRuleInput,
  ) {
    return this.service.addRule(workspace.id, input as unknown as Parameters<HyperPersonalizationService['addRule']>[1]);
  }

  @Mutation(() => PersonalizationEventDTO)
  async trackPersonalizationEvent(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: TrackEventInput,
  ) {
    return this.service.trackEvent(workspace.id, input as unknown as Parameters<HyperPersonalizationService['trackEvent']>[1]);
  }

  @Query(() => PersonalizedContentDTO)
  async getPersonalizedContent(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('contactId') contactId: string,
    @Args('channel') channel: string,
  ) {
    return this.service.getPersonalizedContent(workspace.id, contactId, channel);
  }

  @Query(() => [SegmentRecommendationDTO])
  async getSegmentRecommendations(@AuthWorkspace() workspace: WorkspaceEntity) {
    return this.service.getSegmentRecommendations(workspace.id);
  }

  @Query(() => Float)
  async calculateEngagementScore(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('contactId') contactId: string,
  ) {
    return this.service.calculateEngagementScore(workspace.id, contactId);
  }
}
