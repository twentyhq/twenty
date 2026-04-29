import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Float, Int } from '@nestjs/graphql';
import { Field, ObjectType, InputType } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { EventManagementService } from './event-management.service';

// --- DTOs ---
@ObjectType()
class CRMEventDTO {
  @Field() id: string;
  @Field({ nullable: true }) name?: string;
  @Field({ nullable: true }) type?: string;
  @Field({ nullable: true }) startDate?: Date;
  @Field({ nullable: true }) endDate?: Date;
  @Field(() => Int, { nullable: true }) capacity?: number;
  @Field(() => Int, { nullable: true }) registrationCount?: number;
}

@ObjectType()
class EventRegistrationDTO {
  @Field() id: string;
  @Field({ nullable: true }) status?: string;
  @Field({ nullable: true }) qrCode?: string;
  @Field({ nullable: true }) checkedInAt?: Date;
}

@ObjectType()
class EventROIDTO {
  @Field(() => Float) cost: number;
  @Field(() => Int) leads: number;
  @Field(() => Int) deals: number;
  @Field(() => Float) revenue: number;
  @Field(() => Float) roi: number;
}

@InputType()
class CreateEventInput {
  @Field() name: string;
  @Field({ nullable: true }) type?: string;
  @Field({ nullable: true }) startDate?: Date;
  @Field({ nullable: true }) endDate?: Date;
  @Field(() => Int, { nullable: true }) capacity?: number;
  @Field({ nullable: true }) venue?: string;
}

// --- Resolver ---
@MetadataResolver()
@UseGuards(WorkspaceAuthGuard, UserAuthGuard)
export class EventManagementResolver {
  constructor(private readonly service: EventManagementService) {}

  @Mutation(() => CRMEventDTO)
  async createEvent(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: CreateEventInput,
  ) {
    return this.service.createEvent(workspace.id, input);
  }

  @Mutation(() => EventRegistrationDTO)
  async registerAttendee(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('eventId') eventId: string,
    @Args('contactId') contactId: string,
  ) {
    return this.service.registerAttendee(eventId, contactId);
  }

  @Mutation(() => EventRegistrationDTO)
  async checkInAttendee(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('registrationId') registrationId: string,
  ) {
    return this.service.checkIn(registrationId);
  }

  @Mutation(() => EventRegistrationDTO)
  async checkInByQR(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('qrCode') qrCode: string,
  ) {
    return this.service.checkInByQR(qrCode);
  }

  @Query(() => EventROIDTO)
  async getEventROI(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('eventId') eventId: string,
  ) {
    return this.service.getROI(eventId);
  }

  @Mutation(() => CRMEventDTO)
  async cloneEvent(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('eventId') eventId: string,
    @Args('newStartDate') newStartDate: Date,
  ) {
    return this.service.cloneEvent(eventId, newStartDate);
  }
}
