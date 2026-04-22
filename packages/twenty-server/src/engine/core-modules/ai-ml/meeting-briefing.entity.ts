import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

export enum BriefingStatus {
  PENDING = 'pending',
  GENERATING = 'generating',
  READY = 'ready',
  FAILED = 'failed',
}

@Entity('meeting_briefing')
@Index(['workspaceId', 'meetingId'])
export class MeetingBriefingEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @Column({ nullable: false })
  meetingId: string;

  @Column({ nullable: false })
  userId: string;

  @Column({ nullable: true })
  meetingTitle: string;

  @Column({ type: 'timestamp', nullable: true })
  meetingDate: Date;

  @Column({ nullable: true })
  meetingWith: string;

  @Column({ type: 'enum', enum: BriefingStatus, default: BriefingStatus.PENDING })
  status: BriefingStatus;

  @Column({ type: 'text', nullable: true })
  summary: string;

  @Column({ type: 'simple-json', nullable: true })
  keyPoints: string[];

  @Column({ type: 'simple-json', nullable: true })
  discussionTopics: string[];

  @Column({ type: 'simple-json', nullable: true })
  suggestedQuestions: string[];

  @Column({ type: 'simple-json', nullable: true })
  talkingPoints: string[];

  @Column({ type: 'simple-json', nullable: true })
  relevantDeals: Array<{ id: string; name: string; value: number; stage: string }>;

  @Column({ type: 'simple-json', nullable: true })
  companyContext: Record<string, unknown>;

  @Column({ type: 'simple-json', nullable: true })
  competitorMentions: string[];

  @Column({ type: 'simple-array', nullable: true })
  actionItems: string[];

  @Column({ type: 'text', nullable: true })
  failureReason: string;

  @Column({ type: 'int', default: 0 })
  generationTimeMs: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  generatedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
