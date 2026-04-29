import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum InboxChannel {
  EMAIL = 'email',
  WHATSAPP = 'whatsapp',
  SMS = 'sms',
  CHAT = 'chat',
  LINKEDIN = 'linkedin',
  VOICE = 'voice',
  FACEBOOK = 'facebook',
  INSTAGRAM = 'instagram',
}

export enum ConversationStatus {
  OPEN = 'open',
  ASSIGNED = 'assigned',
  WAITING = 'waiting',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export enum ConversationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

// Unified conversation thread across channels
@Entity('unified_conversation')
@Index(['workspaceId', 'status'])
@Index(['workspaceId', 'assigneeId'])
@Index(['workspaceId', 'contactId'])
@Index(['workspaceId', 'channel'])
export class UnifiedConversationEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ type: 'enum', enum: InboxChannel }) channel: InboxChannel;
  @Column({ type: 'enum', enum: ConversationStatus, default: ConversationStatus.OPEN }) status: ConversationStatus;
  @Column({ type: 'enum', enum: ConversationPriority, default: ConversationPriority.NORMAL }) priority: ConversationPriority;
  @Column({ nullable: true }) contactId: string;
  @Column({ nullable: true }) accountId: string;
  @Column({ nullable: true }) dealId: string;
  @Column({ nullable: true }) ticketId: string;
  @Column({ nullable: true }) assigneeId: string;
  @Column({ type: 'varchar', length: 100, nullable: true }) teamId: string;
  @Column({ type: 'varchar', length: 255, nullable: true }) subject: string;
  @Column({ type: 'varchar', length: 100, nullable: true }) externalId: string;
  @Column({ type: 'varchar', length: 255, nullable: true }) participantIdentifier: string;
  @Column({ type: 'text', nullable: true }) lastMessagePreview: string;
  @Column({ type: 'timestamp', nullable: true }) lastMessageAt: Date;
  @Column({ type: 'int', default: 0 }) messageCount: number;
  @Column({ type: 'int', default: 0 }) unreadCount: number;
  @Column({ type: 'boolean', default: false }) isBot: boolean;
  @Column({ type: 'float', nullable: true }) sentimentScore: number;
  @Column({ type: 'varchar', length: 50, nullable: true }) intentClassification: string;
  @Column({ type: 'simple-array', nullable: true }) tags: string[];
  @Column({ type: 'timestamp', nullable: true }) firstResponseAt: Date;
  @Column({ type: 'timestamp', nullable: true }) resolvedAt: Date;
  @Column({ type: 'int', default: 0 }) responseTimeSeconds: number;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

// Individual message in a conversation
@Entity('unified_message')
@Index(['conversationId', 'createdAt'])
export class UnifiedMessageEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) conversationId: string;
  @Column({ type: 'enum', enum: InboxChannel }) channel: InboxChannel;
  @Column({ type: 'boolean', default: false }) isInbound: boolean;
  @Column({ type: 'boolean', default: false }) isInternal: boolean;
  @Column({ type: 'varchar', length: 100, nullable: true }) senderId: string;
  @Column({ type: 'varchar', length: 255, nullable: true }) senderName: string;
  @Column({ type: 'text', nullable: false }) body: string;
  @Column({ type: 'text', nullable: true }) htmlBody: string;
  @Column({ type: 'varchar', length: 50, default: 'text' }) contentType: string;
  @Column({ type: 'simple-array', nullable: true }) attachmentIds: string[];
  @Column({ type: 'varchar', length: 255, nullable: true }) mediaUrl: string;
  @Column({ type: 'varchar', length: 100, nullable: true }) externalMessageId: string;
  @Column({ type: 'varchar', length: 20, default: 'sent' }) deliveryStatus: string;
  @Column({ type: 'timestamp', nullable: true }) readAt: Date;
  @Column({ type: 'boolean', default: false }) isBotGenerated: boolean;
  @Column({ type: 'float', nullable: true }) sentimentScore: number;
  @CreateDateColumn() createdAt: Date;
}

// WhatsApp approved templates
@Entity('whatsapp_template')
@Index(['workspaceId'])
export class WhatsAppTemplateEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ nullable: false }) name: string;
  @Column({ type: 'varchar', length: 10, default: 'es' }) language: string;
  @Column({ type: 'varchar', length: 50, default: 'pending' }) approvalStatus: string;
  @Column({ type: 'varchar', length: 50, nullable: true }) category: string;
  @Column({ type: 'text', nullable: false }) body: string;
  @Column({ type: 'text', nullable: true }) header: string;
  @Column({ type: 'text', nullable: true }) footer: string;
  @Column({ type: 'simple-json', nullable: true }) buttons: Array<{ type: string; text: string; url?: string; phone?: string }>;
  @Column({ type: 'simple-json', nullable: true }) variables: string[];
  @Column({ type: 'int', default: 0 }) useCount: number;
  @CreateDateColumn() createdAt: Date;
}

// Live chat widget configuration
@Entity('chat_widget')
@Index(['workspaceId'])
export class ChatWidgetEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ nullable: false }) name: string;
  @Column({ type: 'varchar', length: 7, default: '#000000' }) primaryColor: string;
  @Column({ type: 'varchar', length: 255, nullable: true }) logoUrl: string;
  @Column({ type: 'text', nullable: true }) welcomeMessage: string;
  @Column({ type: 'text', nullable: true }) offlineMessage: string;
  @Column({ type: 'boolean', default: true }) enableBot: boolean;
  @Column({ type: 'boolean', default: true }) enableFileUpload: boolean;
  @Column({ type: 'boolean', default: true }) requireEmail: boolean;
  @Column({ type: 'simple-json', nullable: true }) preQualQuestions: Array<{ question: string; type: string; options?: string[] }>;
  @Column({ type: 'simple-json', nullable: true }) businessHours: { start: string; end: string; timezone: string; workDays: number[] };
  @Column({ type: 'simple-array', nullable: true }) allowedDomains: string[];
  @Column({ type: 'boolean', default: true }) isActive: boolean;
  @CreateDateColumn() createdAt: Date;
}

// LinkedIn sync configuration
@Entity('linkedin_sync')
@Index(['workspaceId'])
export class LinkedInSyncEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ nullable: true }) userId: string;
  @Column({ type: 'text', nullable: true }) accessToken: string;
  @Column({ type: 'varchar', length: 255, nullable: true }) salesNavSeatId: string;
  @Column({ type: 'boolean', default: false }) syncMessages: boolean;
  @Column({ type: 'boolean', default: false }) syncActivity: boolean;
  @Column({ type: 'boolean', default: false }) trackJobChanges: boolean;
  @Column({ type: 'timestamp', nullable: true }) lastSyncAt: Date;
  @Column({ type: 'int', default: 0 }) messagesImported: number;
  @Column({ type: 'varchar', length: 20, default: 'disconnected' }) status: string;
  @CreateDateColumn() createdAt: Date;
}

// Meeting scheduler
@Entity('meeting_scheduler')
@Index(['workspaceId'])
export class MeetingSchedulerEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ nullable: false }) name: string;
  @Column({ type: 'varchar', length: 50, default: 'round_robin' }) distributionMode: string;
  @Column({ type: 'simple-array', nullable: true }) teamMemberIds: string[];
  @Column({ type: 'int', default: 30 }) durationMinutes: number;
  @Column({ type: 'int', default: 15 }) bufferMinutes: number;
  @Column({ type: 'simple-json', nullable: true }) availability: { start: string; end: string; timezone: string; workDays: number[] };
  @Column({ type: 'int', default: 7 }) advanceBookingDays: number;
  @Column({ type: 'text', nullable: true }) confirmationMessage: string;
  @Column({ type: 'simple-json', nullable: true }) reminders: Array<{ minutesBefore: number; channel: string }>;
  @Column({ type: 'varchar', length: 500, nullable: true }) bookingLink: string;
  @Column({ type: 'varchar', length: 50, nullable: true }) calendarProvider: string;
  @Column({ type: 'int', default: 0 }) totalBookings: number;
  @Column({ type: 'boolean', default: true }) isActive: boolean;
  @CreateDateColumn() createdAt: Date;
}

// Social media monitoring
@Entity('social_monitor')
@Index(['workspaceId'])
export class SocialMonitorEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ type: 'varchar', length: 50, nullable: false }) platform: string;
  @Column({ type: 'simple-array', nullable: true }) keywords: string[];
  @Column({ type: 'simple-array', nullable: true }) competitors: string[];
  @Column({ type: 'boolean', default: true }) trackMentions: boolean;
  @Column({ type: 'boolean', default: true }) trackJobChanges: boolean;
  @Column({ type: 'boolean', default: true }) trackBuyingSignals: boolean;
  @Column({ type: 'boolean', default: true }) isActive: boolean;
  @CreateDateColumn() createdAt: Date;
}

@Entity('social_signal')
@Index(['workspaceId', 'createdAt'])
@Index(['workspaceId', 'contactId'])
export class SocialSignalEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ type: 'varchar', length: 50 }) platform: string;
  @Column({ type: 'varchar', length: 50 }) signalType: string;
  @Column({ nullable: true }) contactId: string;
  @Column({ nullable: true }) accountId: string;
  @Column({ type: 'text', nullable: true }) content: string;
  @Column({ type: 'varchar', length: 500, nullable: true }) sourceUrl: string;
  @Column({ type: 'float', nullable: true }) relevanceScore: number;
  @Column({ type: 'boolean', default: false }) processed: boolean;
  @CreateDateColumn() createdAt: Date;
}
