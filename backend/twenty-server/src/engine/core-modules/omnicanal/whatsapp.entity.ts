import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

export enum WhatsAppStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  PENDING = 'pending',
}

export enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
}

@Entity('whatsapp_config')
@Index(['workspaceId'])
export class WhatsAppConfigEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phoneNumberId: string;

  @Column({ type: 'text', nullable: true })
  accessToken: string;

  @Column({ type: 'boolean', default: false })
  businessAccountVerified: boolean;

  @Column({ type: 'enum', enum: WhatsAppStatus, default: WhatsAppStatus.DISCONNECTED })
  status: WhatsAppStatus;

  @Column({ type: 'int', default: 0 })
  messagesSent: number;

  @Column({ type: 'int', default: 0 })
  messagesReceived: number;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('whatsapp_message')
@Index(['workspaceId', 'createdAt'])
export class WhatsAppMessageEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @Column({ nullable: false })
  messageId: string;

  @Column({ nullable: true })
  from: string;

  @Column({ nullable: true })
  to: string;

  @Column({ type: 'text', nullable: false })
  body: string;

  @Column({ type: 'enum', enum: MessageStatus, default: MessageStatus.SENT })
  status: MessageStatus;

  @Column({ type: 'boolean', default: false })
  isIncoming: boolean;

  @Column({ nullable: true })
  mediaUrl: string;

  @CreateDateColumn()
  createdAt: Date;
}