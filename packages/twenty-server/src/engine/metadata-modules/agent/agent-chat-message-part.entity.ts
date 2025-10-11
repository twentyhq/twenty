import { JSONValue } from 'ai';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

import { AgentChatMessageEntity } from './agent-chat-message.entity';

@Entity('agentChatMessagePart')
export class AgentChatMessagePartEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  @Index()
  messageId: string;

  @ManyToOne(() => AgentChatMessageEntity, (message) => message.parts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'messageId' })
  message: Relation<AgentChatMessageEntity>;

  @Column({ type: 'int' })
  orderIndex: number;

  @Column({ type: 'varchar' })
  type: string;

  @Column({ type: 'text', nullable: true })
  textContent: string | null;

  @Column({ type: 'text', nullable: true })
  reasoningContent: string | null;

  @Column({ type: 'varchar', nullable: true })
  toolName: string | null;

  @Column({ type: 'varchar', nullable: true })
  toolCallId: string | null;

  @Column({ type: 'jsonb', nullable: true })
  toolInput: unknown | null;

  @Column({ type: 'jsonb', nullable: true })
  toolOutput: unknown | null;

  @Column({ type: 'varchar', nullable: true })
  state: string | null;

  @Column({ type: 'text', nullable: true })
  errorMessage: string | null;

  @Column({ type: 'jsonb', nullable: true })
  errorDetails: Record<string, unknown> | null;

  @Column({ type: 'varchar', nullable: true })
  sourceUrlSourceId: string | null;

  @Column({ type: 'varchar', nullable: true })
  sourceUrlUrl: string | null;

  @Column({ type: 'varchar', nullable: true })
  sourceUrlTitle: string | null;

  @Column({ type: 'varchar', nullable: true })
  sourceDocumentSourceId: string | null;

  @Column({ type: 'varchar', nullable: true })
  sourceDocumentMediaType: string | null;

  @Column({ type: 'varchar', nullable: true })
  sourceDocumentTitle: string | null;

  @Column({ type: 'varchar', nullable: true })
  sourceDocumentFilename: string | null;

  @Column({ type: 'varchar', nullable: true })
  fileMediaType: string | null;

  @Column({ type: 'varchar', nullable: true })
  fileFilename: string | null;

  @Column({ type: 'varchar', nullable: true })
  fileUrl: string | null;

  @Column({ type: 'jsonb', nullable: true })
  providerMetadata: Record<string, Record<string, JSONValue>> | null;

  @CreateDateColumn()
  createdAt: Date;
}
