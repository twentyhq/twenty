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
  meetingTitle: string | null;

  @Column({ type: 'timestamp', nullable: true })
  meetingDate: Date | null;

  @Column({ nullable: true })
  meetingWith: string | null;

  @Column({ type: 'enum', enum: BriefingStatus, default: BriefingStatus.PENDING })
  status: BriefingStatus;

  @Column({ type: 'text', nullable: true })
  summary: string | null;

  @Column({ type: 'simple-json', nullable: true })
  keyPoints: string[] | null;

  @Column({ type: 'simple-json', nullable: true })
  discussionTopics: string[] | null;

  @Column({ type: 'simple-json', nullable: true })
  suggestedQuestions: string[] | null;

  @Column({ type: 'simple-json', nullable: true })
  talkingPoints: string[] | null;

  @Column({ type: 'simple-json', nullable: true })
  relevantDeals: Array<{ id: string; name: string; value: number; stage: string }> | null;

  @Column({ type: 'simple-json', nullable: true })
  companyContext: Record<string, unknown> | null;

  @Column({ type: 'simple-json', nullable: true })
  competitorMentions: string[] | null;

  @Column({ type: 'simple-array', nullable: true })
  actionItems: string[] | null;

  @Column({ type: 'text', nullable: true })
  failureReason: string | null;

  @Column({ type: 'int', default: 0 })
  generationTimeMs: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  generatedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
