import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Float, Int } from '@nestjs/graphql';
import { Field, ObjectType, InputType } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldServiceService } from './field-service.service';

// --- DTOs ---
@ObjectType()
class WorkOrderDTO {
  @Field() id: string;
  @Field({ nullable: true }) status?: string;
  @Field({ nullable: true }) technicianId?: string;
  @Field({ nullable: true }) type?: string;
}

@ObjectType()
class TechnicianDTO {
  @Field() id: string;
  @Field({ nullable: true }) name?: string;
  @Field({ nullable: true }) isAvailable?: boolean;
}

@ObjectType()
class FieldServiceAnalyticsDTO {
  @Field(() => Int) totalOrders: number;
  @Field(() => Int) completed: number;
  @Field(() => Int) ftfr: number;
  @Field(() => Float) avgRating: number;
  @Field(() => Int) avgResponseMinutes: number;
}

@InputType()
class CreateWorkOrderInput {
  @Field({ nullable: true }) accountId?: string;
  @Field({ nullable: true }) type?: string;
  @Field({ nullable: true }) description?: string;
  @Field({ nullable: true }) priority?: string;
  @Field(() => Float, { nullable: true }) latitude?: number;
  @Field(() => Float, { nullable: true }) longitude?: number;
}

@InputType()
class CompleteWorkInput {
  @Field({ nullable: true }) signature?: string;
  @Field(() => [String], { nullable: true }) photoIds?: string[];
  @Field({ nullable: true }) firstTimeFix?: boolean;
}

@InputType()
class RegisterTechnicianInput {
  @Field({ nullable: true }) name?: string;
  @Field({ nullable: true }) userId?: string;
  @Field(() => [String], { nullable: true }) skills?: string[];
}

// --- Resolver ---
@MetadataResolver()
@UseGuards(WorkspaceAuthGuard, UserAuthGuard)
export class FieldServiceResolver {
  constructor(private readonly service: FieldServiceService) {}

  @Mutation(() => WorkOrderDTO)
  async createWorkOrder(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: CreateWorkOrderInput,
  ) {
    return this.service.createWorkOrder(workspace.id, input);
  }

  @Mutation(() => WorkOrderDTO)
  async autoDispatchWorkOrder(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('workOrderId') workOrderId: string,
  ) {
    return this.service.autoDispatch(workspace.id, workOrderId);
  }

  @Mutation(() => WorkOrderDTO)
  async startWork(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('workOrderId') workOrderId: string,
  ) {
    return this.service.startWork(workOrderId);
  }

  @Mutation(() => WorkOrderDTO)
  async completeWork(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('workOrderId') workOrderId: string,
    @Args('input') input: CompleteWorkInput,
  ) {
    return this.service.completeWork(workOrderId, input);
  }

  @Mutation(() => TechnicianDTO)
  async registerTechnician(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: RegisterTechnicianInput,
  ) {
    return this.service.registerTechnician(workspace.id, input);
  }

  @Query(() => FieldServiceAnalyticsDTO)
  async getFieldServiceAnalytics(@AuthWorkspace() workspace: WorkspaceEntity) {
    return this.service.getAnalytics(workspace.id);
  }
}
