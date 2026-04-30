import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Float, Int } from '@nestjs/graphql';
import { Field, ObjectType, InputType } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { IncidentManagementService } from './incident-management.service';

@ObjectType()
class IncidentDTO {
  @Field() id: string;
  @Field() title: string;
  @Field({ nullable: true }) severity?: string;
  @Field({ nullable: true }) status?: string;
  @Field({ nullable: true }) service?: string;
  @Field(() => Int, { nullable: true }) affectedUsersCount?: number;
  @Field(() => Int, { nullable: true }) timeToResolveMinutes?: number;
}

@ObjectType()
class IncidentTimelineDTO {
  @Field() id: string;
  @Field() entryType: string;
  @Field() content: string;
  @Field({ nullable: true }) authorName?: string;
}

@ObjectType()
class PostmortemDTO {
  @Field() id: string;
  @Field() title: string;
  @Field({ nullable: true }) status?: string;
  @Field({ nullable: true }) rootCauseAnalysis?: string;
}

@ObjectType()
class MTTRMetricsDTO {
  @Field(() => Int) overallMTTR: number;
  @Field(() => Int) totalIncidents: number;
  @Field(() => Int) resolvedIncidents: number;
  @Field(() => Int) avgTimeToAcknowledge: number;
}

@InputType()
class CreateIncidentInput {
  @Field() title: string;
  @Field({ nullable: true }) description?: string;
  @Field({ nullable: true }) severity?: string;
  @Field({ nullable: true }) service?: string;
  @Field({ nullable: true }) assigneeId?: string;
}

@InputType()
class ResolveIncidentInput {
  @Field() rootCause: string;
  @Field() resolution: string;
}

@InputType()
class AddTimelineInput {
  @Field() incidentId: string;
  @Field() content: string;
  @Field({ nullable: true }) entryType?: string;
  @Field({ nullable: true }) authorName?: string;
  @Field({ nullable: true }) isPublic?: boolean;
}

@InputType()
class CreatePostmortemInput {
  @Field() incidentId: string;
  @Field({ nullable: true }) title?: string;
  @Field({ nullable: true }) summary?: string;
  @Field({ nullable: true }) impact?: string;
  @Field({ nullable: true }) rootCauseAnalysis?: string;
}

@MetadataResolver()
@UseGuards(WorkspaceAuthGuard, UserAuthGuard)
export class IncidentManagementResolver {
  constructor(private readonly service: IncidentManagementService) {}

  @Mutation(() => IncidentDTO)
  async createIncident(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: CreateIncidentInput,
  ) {
    return this.service.createIncident(workspace.id, input as unknown as Parameters<IncidentManagementService['createIncident']>[1]);
  }

  @Mutation(() => IncidentDTO)
  async escalateIncident(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('incidentId') incidentId: string,
    @Args('level') level: string,
  ) {
    return this.service.escalate(workspace.id, incidentId, level as unknown as Parameters<IncidentManagementService['escalate']>[2]);
  }

  @Mutation(() => IncidentTimelineDTO)
  async addIncidentTimelineEntry(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: AddTimelineInput,
  ) {
    return this.service.addTimelineEntry(workspace.id, input.incidentId, input as unknown as Parameters<IncidentManagementService['addTimelineEntry']>[2]);
  }

  @Mutation(() => PostmortemDTO)
  async createPostmortem(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: CreatePostmortemInput,
  ) {
    return this.service.createPostmortem(workspace.id, input.incidentId, input);
  }

  @Mutation(() => IncidentDTO)
  async resolveIncident(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('incidentId') incidentId: string,
    @Args('input') input: ResolveIncidentInput,
  ) {
    return this.service.resolveIncident(workspace.id, incidentId, input);
  }

  @Query(() => [IncidentDTO])
  async getActiveIncidents(@AuthWorkspace() workspace: WorkspaceEntity) {
    return this.service.getActiveIncidents(workspace.id);
  }

  @Query(() => MTTRMetricsDTO)
  async getIncidentMTTR(@AuthWorkspace() workspace: WorkspaceEntity) {
    return this.service.getMTTR(workspace.id);
  }
}
