import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import {
  UnifiedConversationEntity, UnifiedMessageEntity, WhatsAppTemplateEntity,
  ChatWidgetEntity, LinkedInSyncEntity, MeetingSchedulerEntity,
  SocialMonitorEntity, SocialSignalEntity,
  InboxChannel, ConversationStatus, ConversationPriority,
} from './unified-inbox.entity';

@Injectable()
export class UnifiedInboxService {
  constructor(
    @InjectRepository(UnifiedConversationEntity) private readonly convRepo: Repository<UnifiedConversationEntity>,
    @InjectRepository(UnifiedMessageEntity) private readonly msgRepo: Repository<UnifiedMessageEntity>,
    @InjectRepository(WhatsAppTemplateEntity) private readonly waTemplateRepo: Repository<WhatsAppTemplateEntity>,
    @InjectRepository(ChatWidgetEntity) private readonly widgetRepo: Repository<ChatWidgetEntity>,
    @InjectRepository(LinkedInSyncEntity) private readonly linkedinRepo: Repository<LinkedInSyncEntity>,
    @InjectRepository(MeetingSchedulerEntity) private readonly schedulerRepo: Repository<MeetingSchedulerEntity>,
    @InjectRepository(SocialMonitorEntity) private readonly monitorRepo: Repository<SocialMonitorEntity>,
    @InjectRepository(SocialSignalEntity) private readonly signalRepo: Repository<SocialSignalEntity>,
  ) {}

  // ==================== UNIFIED INBOX ====================

  async getInbox(
    workspaceId: string,
    filters: { channel?: InboxChannel; status?: ConversationStatus; assigneeId?: string; unreadOnly?: boolean } = {},
  ): Promise<UnifiedConversationEntity[]> {
    const qb = this.convRepo.createQueryBuilder('c').where('c.workspaceId = :workspaceId', { workspaceId });
    if (filters.channel) qb.andWhere('c.channel = :channel', { channel: filters.channel });
    if (filters.status) qb.andWhere('c.status = :status', { status: filters.status });
    if (filters.assigneeId) qb.andWhere('c.assigneeId = :assigneeId', { assigneeId: filters.assigneeId });
    if (filters.unreadOnly) qb.andWhere('c.unreadCount > 0');
    return qb.orderBy('c.lastMessageAt', 'DESC').take(50).getMany();
  }

  async createConversation(workspaceId: string, data: Partial<UnifiedConversationEntity>): Promise<UnifiedConversationEntity> {
    return this.convRepo.save(this.convRepo.create({ workspaceId, ...data }));
  }

  async assignConversation(conversationId: string, assigneeId: string): Promise<UnifiedConversationEntity> {
    const conv = await this.findConvOrFail(conversationId);
    conv.assigneeId = assigneeId;
    conv.status = ConversationStatus.ASSIGNED;
    return this.convRepo.save(conv);
  }

  async autoAssignRoundRobin(workspaceId: string, conversationId: string, teamMemberIds: string[]): Promise<UnifiedConversationEntity> {
    const recent = await this.convRepo.find({
      where: { workspaceId, assigneeId: In(teamMemberIds) },
      order: { updatedAt: 'DESC' },
      take: teamMemberIds.length,
    });
    const assignCounts: Record<string, number> = {};
    for (const id of teamMemberIds) assignCounts[id] = 0;
    for (const conv of recent) { if (conv.assigneeId && assignCounts[conv.assigneeId] !== undefined) assignCounts[conv.assigneeId]++; }
    const leastBusy = Object.entries(assignCounts).sort((a, b) => a[1] - b[1])[0][0];
    return this.assignConversation(conversationId, leastBusy);
  }

  async sendMessage(conversationId: string, data: {
    body: string; senderId?: string; senderName?: string; isInternal?: boolean;
    attachmentIds?: string[]; mediaUrl?: string; isBotGenerated?: boolean;
  }): Promise<UnifiedMessageEntity> {
    const conv = await this.findConvOrFail(conversationId);
    const msg = await this.msgRepo.save(this.msgRepo.create({
      conversationId, channel: conv.channel, isInbound: false,
      body: data.body, senderId: data.senderId, senderName: data.senderName,
      isInternal: data.isInternal ?? false, attachmentIds: data.attachmentIds,
      mediaUrl: data.mediaUrl, isBotGenerated: data.isBotGenerated ?? false,
    }));

    conv.lastMessagePreview = data.body.substring(0, 100);
    conv.lastMessageAt = new Date();
    conv.messageCount++;
    if (!conv.firstResponseAt && !data.isInternal) conv.firstResponseAt = new Date();
    await this.convRepo.save(conv);
    return msg;
  }

  async receiveMessage(workspaceId: string, data: {
    channel: InboxChannel; body: string; participantIdentifier: string;
    externalMessageId?: string; senderName?: string; mediaUrl?: string;
    contactId?: string;
  }): Promise<{ conversation: UnifiedConversationEntity; message: UnifiedMessageEntity }> {
    let conv = await this.convRepo.findOne({
      where: { workspaceId, channel: data.channel, participantIdentifier: data.participantIdentifier, status: In([ConversationStatus.OPEN, ConversationStatus.ASSIGNED, ConversationStatus.WAITING]) },
    });

    if (!conv) {
      conv = await this.convRepo.save(this.convRepo.create({
        workspaceId, channel: data.channel, participantIdentifier: data.participantIdentifier,
        contactId: data.contactId, status: ConversationStatus.OPEN,
      }));
    }

    const msg = await this.msgRepo.save(this.msgRepo.create({
      conversationId: conv.id, channel: data.channel, isInbound: true,
      body: data.body, senderName: data.senderName, externalMessageId: data.externalMessageId,
      mediaUrl: data.mediaUrl,
    }));

    conv.lastMessagePreview = data.body.substring(0, 100);
    conv.lastMessageAt = new Date();
    conv.messageCount++;
    conv.unreadCount++;
    await this.convRepo.save(conv);

    return { conversation: conv, message: msg };
  }

  async getMessages(conversationId: string, limit = 50): Promise<UnifiedMessageEntity[]> {
    return this.msgRepo.find({ where: { conversationId }, order: { createdAt: 'ASC' }, take: limit });
  }

  async resolveConversation(conversationId: string): Promise<UnifiedConversationEntity> {
    const conv = await this.findConvOrFail(conversationId);
    conv.status = ConversationStatus.RESOLVED;
    conv.resolvedAt = new Date();
    if (conv.firstResponseAt) {
      conv.responseTimeSeconds = Math.floor((conv.firstResponseAt.getTime() - conv.createdAt.getTime()) / 1000);
    }
    return this.convRepo.save(conv);
  }

  async markRead(conversationId: string): Promise<void> {
    await this.convRepo.update(conversationId, { unreadCount: 0 });
  }

  // ==================== WHATSAPP TEMPLATES ====================

  async createWATemplate(workspaceId: string, data: Partial<WhatsAppTemplateEntity>): Promise<WhatsAppTemplateEntity> {
    return this.waTemplateRepo.save(this.waTemplateRepo.create({ workspaceId, ...data }));
  }

  async getWATemplates(workspaceId: string): Promise<WhatsAppTemplateEntity[]> {
    return this.waTemplateRepo.find({ where: { workspaceId }, order: { useCount: 'DESC' } });
  }

  async sendWAFromTemplate(workspaceId: string, templateId: string, to: string, variables: Record<string, string>): Promise<UnifiedMessageEntity> {
    const template = await this.waTemplateRepo.findOne({ where: { id: templateId } });
    if (!template) throw new NotFoundException(`Template ${templateId} not found`);
    let body = template.body;
    for (const [key, value] of Object.entries(variables)) {
      body = body.replace(`{{${key}}}`, value);
    }
    template.useCount++;
    await this.waTemplateRepo.save(template);

    const { conversation, message } = await this.receiveMessage(workspaceId, {
      channel: InboxChannel.WHATSAPP, body, participantIdentifier: to,
    });
    return message;
  }

  // ==================== LIVE CHAT WIDGET ====================

  async createChatWidget(workspaceId: string, data: Partial<ChatWidgetEntity>): Promise<ChatWidgetEntity> {
    const widget = await this.widgetRepo.save(this.widgetRepo.create({ workspaceId, ...data }));
    return widget;
  }

  async getChatWidget(workspaceId: string): Promise<ChatWidgetEntity | null> {
    return this.widgetRepo.findOne({ where: { workspaceId, isActive: true } });
  }

  async handleChatMessage(workspaceId: string, visitorId: string, body: string, visitorEmail?: string): Promise<{
    conversation: UnifiedConversationEntity;
    message: UnifiedMessageEntity;
    botResponse?: string;
  }> {
    const result = await this.receiveMessage(workspaceId, {
      channel: InboxChannel.CHAT, body, participantIdentifier: visitorId,
      senderName: visitorEmail ?? `Visitor ${visitorId.substring(0, 6)}`,
    });

    const widget = await this.getChatWidget(workspaceId);
    let botResponse: string | undefined;
    if (widget?.enableBot && result.conversation.messageCount <= 1) {
      botResponse = widget.welcomeMessage ?? 'Hola, ¿en qué puedo ayudarte?';
      await this.sendMessage(result.conversation.id, { body: botResponse, senderName: 'Bot', isBotGenerated: true });
    }

    return { ...result, botResponse };
  }

  // ==================== LINKEDIN SYNC ====================

  async setupLinkedIn(workspaceId: string, data: Partial<LinkedInSyncEntity>): Promise<LinkedInSyncEntity> {
    return this.linkedinRepo.save(this.linkedinRepo.create({ workspaceId, ...data, status: 'connected' }));
  }

  async importLinkedInMessage(workspaceId: string, userId: string, data: {
    contactId: string; body: string; senderName: string; externalId: string;
  }): Promise<UnifiedMessageEntity> {
    const { message } = await this.receiveMessage(workspaceId, {
      channel: InboxChannel.LINKEDIN, body: data.body, participantIdentifier: data.externalId,
      senderName: data.senderName, contactId: data.contactId,
    });
    await this.linkedinRepo.increment({ workspaceId, userId }, 'messagesImported', 1);
    return message;
  }

  // ==================== MEETING SCHEDULER ====================

  async createScheduler(workspaceId: string, data: Partial<MeetingSchedulerEntity>): Promise<MeetingSchedulerEntity> {
    const scheduler = await this.schedulerRepo.save(this.schedulerRepo.create({ workspaceId, ...data }));
    scheduler.bookingLink = `/schedule/${scheduler.id}`;
    return this.schedulerRepo.save(scheduler);
  }

  async getNextAvailableSlot(schedulerId: string): Promise<{ memberId: string; startTime: Date; endTime: Date } | null> {
    const scheduler = await this.schedulerRepo.findOne({ where: { id: schedulerId } });
    if (!scheduler?.teamMemberIds?.length) return null;

    const memberIndex = scheduler.totalBookings % scheduler.teamMemberIds.length;
    const memberId = scheduler.teamMemberIds[memberIndex];
    const now = new Date();
    now.setMinutes(now.getMinutes() + scheduler.bufferMinutes);
    const roundedMinutes = Math.ceil(now.getMinutes() / 15) * 15;
    now.setMinutes(roundedMinutes, 0, 0);

    return {
      memberId,
      startTime: now,
      endTime: new Date(now.getTime() + scheduler.durationMinutes * 60_000),
    };
  }

  async bookMeeting(schedulerId: string, contactEmail: string): Promise<{ slot: { memberId: string; startTime: Date; endTime: Date } }> {
    const slot = await this.getNextAvailableSlot(schedulerId);
    if (!slot) throw new NotFoundException('No available slots');
    await this.schedulerRepo.increment({ id: schedulerId }, 'totalBookings', 1);
    return { slot };
  }

  // ==================== SOCIAL MONITORING ====================

  async createMonitor(workspaceId: string, data: Partial<SocialMonitorEntity>): Promise<SocialMonitorEntity> {
    return this.monitorRepo.save(this.monitorRepo.create({ workspaceId, ...data }));
  }

  async recordSignal(workspaceId: string, data: Partial<SocialSignalEntity>): Promise<SocialSignalEntity> {
    return this.signalRepo.save(this.signalRepo.create({ workspaceId, ...data }));
  }

  async getUnprocessedSignals(workspaceId: string): Promise<SocialSignalEntity[]> {
    return this.signalRepo.find({ where: { workspaceId, processed: false }, order: { createdAt: 'DESC' }, take: 50 });
  }

  // ==================== ANALYTICS ====================

  async getInboxMetrics(workspaceId: string): Promise<{
    totalConversations: number;
    openConversations: number;
    avgResponseTime: number;
    byChannel: Record<string, number>;
    avgSentiment: number;
    botResolutionRate: number;
  }> {
    const all = await this.convRepo.find({ where: { workspaceId } });
    const open = all.filter((c) => [ConversationStatus.OPEN, ConversationStatus.ASSIGNED].includes(c.status));
    const resolved = all.filter((c) => c.status === ConversationStatus.RESOLVED);
    const withResponse = resolved.filter((c) => c.responseTimeSeconds > 0);
    const botResolved = resolved.filter((c) => c.isBot);

    const byChannel: Record<string, number> = {};
    for (const c of all) byChannel[c.channel] = (byChannel[c.channel] ?? 0) + 1;

    const withSentiment = all.filter((c) => c.sentimentScore !== null && c.sentimentScore !== undefined);

    return {
      totalConversations: all.length,
      openConversations: open.length,
      avgResponseTime: withResponse.length ? Math.round(withResponse.reduce((s, c) => s + c.responseTimeSeconds, 0) / withResponse.length) : 0,
      byChannel,
      avgSentiment: withSentiment.length ? withSentiment.reduce((s, c) => s + (c.sentimentScore ?? 0), 0) / withSentiment.length : 0,
      botResolutionRate: resolved.length ? Math.round((botResolved.length / resolved.length) * 100) : 0,
    };
  }

  private async findConvOrFail(conversationId: string): Promise<UnifiedConversationEntity> {
    const conv = await this.convRepo.findOne({ where: { id: conversationId } });
    if (!conv) throw new NotFoundException(`Conversation ${conversationId} not found`);
    return conv;
  }
}
