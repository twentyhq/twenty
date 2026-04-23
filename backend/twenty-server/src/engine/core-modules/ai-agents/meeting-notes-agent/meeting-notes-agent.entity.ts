import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { WorkspaceEntity } from '../../workspace/workspace.entity';

export enum MeetingNotesProvider {
  ZOOM = 'ZOOM',
  GOOGLE_MEET = 'GOOGLE_MEET',
  TEAMS = 'TEAMS',
  CAL_COM = 'CAL_COM',
}

export enum MeetingNotesStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

@Entity('ai_agents_meeting_notes')
export class MeetingNotesAgent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  workspaceId: string;

  @ManyToOne(() => WorkspaceEntity, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workspaceId' })
  workspace: WorkspaceEntity;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'enum', enum: MeetingNotesProvider, default: MeetingNotesProvider.ZOOM })
  provider: MeetingNotesProvider;

  @Column({ nullable: true })
  providerAccessToken: string;

  @Column({ default: true })
  autoJoinEnabled: boolean;

  @Column({ default: true })
  autoGenerateNotes: boolean;

  @Column({ default: true })
  autoExtractActionItems: boolean;

  @Column({ default: true })
  autoSendFollowUp: boolean;

  @Column({ nullable: true })
  followUpTemplate: string;

  @Column({ type: 'enum', enum: MeetingNotesStatus, default: MeetingNotesStatus.PENDING })
  status: MeetingNotesStatus;

  @Column({ type: 'int', default: 0 })
  meetingsProcessedCount: number;

  @Column({ type: 'int', default: 0 })
  actionItemsExtractedCount: number;

  @Column({ type: 'int', default: 0 })
  followUpsSentCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('ai_meeting_transcripts')
export class MeetingTranscript {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  workspaceId: string;

  @ManyToOne(() => WorkspaceEntity, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workspaceId' })
  workspace: WorkspaceEntity;

  @Column({ nullable: true })
  meetingId: string;

  @Column({ nullable: true })
  dealId: string | null;

  @Column({ nullable: true })
  contactId: string | null;

  @Column({ type: 'text', nullable: true })
  transcript: string | null;

  @Column({ type: 'jsonb', nullable: true })
  summary: Record<string, unknown> | null;

  @Column({ type: 'jsonb', nullable: true })
  actionItems: Record<string, unknown>[] | null;

  @Column({ type: 'jsonb', nullable: true })
  keyPoints: string[] | null;

  @Column({ type: 'enum', enum: MeetingNotesStatus, default: MeetingNotesStatus.PENDING })
  status: MeetingNotesStatus;

  @Column({ nullable: true })
  duration: number | null;

  @Column({ nullable: true })
  meetingUrl: string | null;

  @Column({ nullable: true })
  recordedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
