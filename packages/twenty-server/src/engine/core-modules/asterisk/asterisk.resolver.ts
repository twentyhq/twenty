import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Float, Int } from '@nestjs/graphql';
import { Field, ObjectType, InputType } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AsteriskService } from './asterisk.service';

// --- DTOs ---
@ObjectType()
class AsteriskServerDTO {
  @Field() id: string;
  @Field({ nullable: true }) name?: string;
  @Field({ nullable: true }) connectionStatus?: string;
  @Field({ nullable: true }) isActive?: boolean;
}

@ObjectType()
class CallLogDTO {
  @Field() id: string;
  @Field({ nullable: true }) uniqueId?: string;
  @Field({ nullable: true }) direction?: string;
  @Field({ nullable: true }) status?: string;
  @Field({ nullable: true }) callerNumber?: string;
  @Field({ nullable: true }) calledNumber?: string;
  @Field(() => Int, { nullable: true }) durationSeconds?: number;
  @Field({ nullable: true }) contactId?: string;
  @Field({ nullable: true }) dealId?: string;
}

@ObjectType()
class SIPExtensionDTO {
  @Field() id: string;
  @Field({ nullable: true }) extension?: string;
  @Field({ nullable: true }) presenceStatus?: string;
}

@ObjectType()
class CallQueueDTO {
  @Field() id: string;
  @Field({ nullable: true }) name?: string;
}

@ObjectType()
class DialerCampaignDTO {
  @Field() id: string;
  @Field({ nullable: true }) name?: string;
  @Field({ nullable: true }) status?: string;
  @Field(() => Int, { nullable: true }) contacted?: number;
  @Field(() => Int, { nullable: true }) connected?: number;
}

@ObjectType()
class TopCallerDTO {
  @Field() userId: string;
  @Field(() => Int) calls: number;
  @Field(() => Int) talkTime: number;
}

@ObjectType()
class CallAnalyticsDTO {
  @Field(() => Int) totalCalls: number;
  @Field(() => Int) inbound: number;
  @Field(() => Int) outbound: number;
  @Field(() => Int) answered: number;
  @Field(() => Int) missed: number;
  @Field(() => Int) avgDuration: number;
  @Field(() => Int) avgWaitTime: number;
  @Field(() => [TopCallerDTO]) topCallers: TopCallerDTO[];
}

@InputType()
class RegisterServerInput {
  @Field() name: string;
  @Field({ nullable: true }) ariUrl?: string;
  @Field({ nullable: true }) ariUser?: string;
  @Field({ nullable: true }) ariPassword?: string;
}

@InputType()
class ClickToCallInput {
  @Field() userId: string;
  @Field() destination: string;
  @Field({ nullable: true }) contactId?: string;
  @Field({ nullable: true }) dealId?: string;
  @Field({ nullable: true }) ticketId?: string;
  @Field({ nullable: true }) callerIdNumber?: string;
}

@InputType()
class CreateExtensionInput {
  @Field() extension: string;
  @Field({ nullable: true }) userId?: string;
  @Field({ nullable: true }) callerIdNumber?: string;
}

@InputType()
class CreateQueueInput {
  @Field() name: string;
  @Field({ nullable: true }) strategy?: string;
}

@InputType()
class CreateDialerCampaignInput {
  @Field() name: string;
  @Field({ nullable: true }) mode?: string;
}

// --- Resolver ---
@MetadataResolver()
@UseGuards(WorkspaceAuthGuard, UserAuthGuard)
export class AsteriskResolver {
  constructor(private readonly service: AsteriskService) {}

  @Mutation(() => AsteriskServerDTO)
  async registerAsteriskServer(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: RegisterServerInput,
  ) {
    return this.service.registerServer(workspace.id, input);
  }

  @Mutation(() => CallLogDTO)
  async clickToCall(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: ClickToCallInput,
  ) {
    return this.service.clickToCall(workspace.id, input.userId, input.destination, {
      contactId: input.contactId, dealId: input.dealId,
      ticketId: input.ticketId, callerIdNumber: input.callerIdNumber,
    });
  }

  @Mutation(() => CallLogDTO, { nullable: true })
  async handleCallEvent(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('uniqueId') uniqueId: string,
    @Args('eventType') eventType: string,
    @Args('data', { nullable: true }) data?: string,
  ) {
    const parsedData = data ? JSON.parse(data) : {};
    return this.service.handleCallEvent(workspace.id, {
      uniqueId,
      eventType: eventType as 'answer' | 'hangup' | 'dtmf' | 'recording_complete',
      data: parsedData,
    });
  }

  @Mutation(() => SIPExtensionDTO)
  async createExtension(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: CreateExtensionInput,
  ) {
    return this.service.createExtension(workspace.id, input);
  }

  @Mutation(() => CallQueueDTO)
  async createCallQueue(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: CreateQueueInput,
  ) {
    return this.service.createQueue(workspace.id, input);
  }

  @Mutation(() => DialerCampaignDTO)
  async createDialerCampaign(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: CreateDialerCampaignInput,
  ) {
    return this.service.createDialerCampaign(workspace.id, input as any);
  }

  @Query(() => CallAnalyticsDTO)
  async getCallAnalytics(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('startDate') startDate: Date,
    @Args('endDate') endDate: Date,
  ) {
    return this.service.getCallAnalytics(workspace.id, startDate, endDate);
  }
}
