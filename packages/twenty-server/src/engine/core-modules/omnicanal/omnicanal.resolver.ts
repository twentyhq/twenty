import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Float, Int } from '@nestjs/graphql';
import { Field, ObjectType, InputType } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

import { UnifiedInboxService } from './unified-inbox.service';

// --- DTOs ---
@ObjectType()
class ConversationDTO {
  @Field() id: string;
  @Field() channel: string;
  @Field() status: string;
  @Field({ nullable: true }) participantIdentifier: string;
  @Field({ nullable: true }) assigneeId: string;
  @Field({ nullable: true }) lastMessagePreview: string;
  @Field(() => Int) messageCount: number;
  @Field(() => Int) unreadCount: number;
  @Field({ nullable: true }) lastMessageAt: Date;
}

@ObjectType()
class MessageDTO {
  @Field() id: string;
  @Field() conversationId: string;
  @Field() channel: string;
  @Field() body: string;
  @Field() isInbound: boolean;
  @Field({ nullable: true }) senderName: string;
  @Field() createdAt: Date;
}

@ObjectType()
class InboxMetricsDTO {
  @Field(() => Int) totalConversations: number;
  @Field(() => Int) openConversations: number;
  @Field(() => Int) avgResponseTime: number;
  @Field(() => Float) avgSentiment: number;
  @Field(() => Int) botResolutionRate: number;
}

@ObjectType()
class ChatWidgetDTO {
  @Field() id: string;
  @Field({ nullable: true }) name: string;
  @Field() isActive: boolean;
  @Field({ nullable: true }) welcomeMessage: string;
  @Field({ nullable: true }) enableBot: boolean;
}

@ObjectType()
class MeetingSlotDTO {
  @Field() memberId: string;
  @Field() startTime: Date;
  @Field() endTime: Date;
}

@ObjectType()
class BookMeetingResultDTO {
  @Field(() => MeetingSlotDTO) slot: MeetingSlotDTO;
}

@ObjectType()
class SocialSignalDTO {
  @Field() id: string;
  @Field({ nullable: true }) platform: string;
  @Field({ nullable: true }) content: string;
  @Field() processed: boolean;
  @Field() createdAt: Date;
}

@InputType()
class InboxFiltersInput {
  @Field({ nullable: true }) channel?: string;
  @Field({ nullable: true }) status?: string;
  @Field({ nullable: true }) assigneeId?: string;
  @Field({ nullable: true }) unreadOnly?: boolean;
}

@InputType()
class SendMessageInput {
  @Field() conversationId: string;
  @Field() body: string;
  @Field({ nullable: true }) senderId?: string;
  @Field({ nullable: true }) senderName?: string;
  @Field({ nullable: true }) isInternal?: boolean;
}

@InputType()
class ReceiveMessageInput {
  @Field() channel: string;
  @Field() body: string;
  @Field() participantIdentifier: string;
  @Field({ nullable: true }) senderName?: string;
  @Field({ nullable: true }) contactId?: string;
}

@InputType()
class CreateChatWidgetInput {
  @Field({ nullable: true }) name?: string;
  @Field({ nullable: true }) welcomeMessage?: string;
  @Field({ nullable: true }) enableBot?: boolean;
}

@InputType()
class CreateSchedulerInput {
  @Field() name: string;
  @Field(() => Int, { nullable: true }) durationMinutes?: number;
  @Field(() => Int, { nullable: true }) bufferMinutes?: number;
  @Field(() => [String], { nullable: true }) teamMemberIds?: string[];
}

// --- Resolver ---
@MetadataResolver()
@UseGuards(WorkspaceAuthGuard, UserAuthGuard)
export class OmnicanalResolver {
  constructor(private readonly inboxService: UnifiedInboxService) {}

  // Unified Inbox
  @Query(() => [ConversationDTO])
  async inbox(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('filters', { nullable: true }) filters?: InboxFiltersInput,
  ) {
    return this.inboxService.getInbox(workspace.id, filters as any);
  }

  @Query(() => [MessageDTO])
  async conversationMessages(
    @Args('conversationId') conversationId: string,
    @Args('limit', { type: () => Int, defaultValue: 50 }) limit: number,
  ) {
    return this.inboxService.getMessages(conversationId, limit);
  }

  @Query(() => InboxMetricsDTO)
  async inboxMetrics(@AuthWorkspace() workspace: WorkspaceEntity) {
    return this.inboxService.getInboxMetrics(workspace.id);
  }

  @Mutation(() => MessageDTO)
  async sendMessage(@Args('input') input: SendMessageInput) {
    return this.inboxService.sendMessage(input.conversationId, input);
  }

  @Mutation(() => MessageDTO)
  async receiveMessage(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: ReceiveMessageInput,
  ) {
    const result = await this.inboxService.receiveMessage(workspace.id, input as any);
    return result.message;
  }

  @Mutation(() => ConversationDTO)
  async assignConversation(
    @Args('conversationId') conversationId: string,
    @Args('assigneeId') assigneeId: string,
  ) {
    return this.inboxService.assignConversation(conversationId, assigneeId);
  }

  @Mutation(() => ConversationDTO)
  async autoAssignRoundRobin(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('conversationId') conversationId: string,
    @Args('teamMemberIds', { type: () => [String] }) teamMemberIds: string[],
  ) {
    return this.inboxService.autoAssignRoundRobin(workspace.id, conversationId, teamMemberIds);
  }

  @Mutation(() => ConversationDTO)
  async resolveConversation(@Args('conversationId') conversationId: string) {
    return this.inboxService.resolveConversation(conversationId);
  }

  @Mutation(() => Boolean)
  async markConversationRead(@Args('conversationId') conversationId: string) {
    await this.inboxService.markRead(conversationId);
    return true;
  }

  // Chat Widget
  @Query(() => ChatWidgetDTO, { nullable: true })
  async chatWidget(@AuthWorkspace() workspace: WorkspaceEntity) {
    return this.inboxService.getChatWidget(workspace.id);
  }

  @Mutation(() => ChatWidgetDTO)
  async createChatWidget(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: CreateChatWidgetInput,
  ) {
    return this.inboxService.createChatWidget(workspace.id, input);
  }

  // Meeting Scheduler
  @Mutation(() => Boolean)
  async createMeetingScheduler(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: CreateSchedulerInput,
  ) {
    await this.inboxService.createScheduler(workspace.id, input);
    return true;
  }

  @Mutation(() => BookMeetingResultDTO)
  async bookMeeting(
    @Args('schedulerId') schedulerId: string,
    @Args('contactEmail') contactEmail: string,
  ) {
    return this.inboxService.bookMeeting(schedulerId, contactEmail);
  }

  // Social Monitoring
  @Query(() => [SocialSignalDTO])
  async unprocessedSignals(@AuthWorkspace() workspace: WorkspaceEntity) {
    return this.inboxService.getUnprocessedSignals(workspace.id);
  }

  // WhatsApp Templates
  @Query(() => [MessageDTO])
  async whatsappTemplates(@AuthWorkspace() workspace: WorkspaceEntity) {
    return this.inboxService.getWATemplates(workspace.id);
  }
}
