import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum IncidentSeverity { SEV1 = 'sev1', SEV2 = 'sev2', SEV3 = 'sev3', SEV4 = 'sev4' }
export enum IncidentStatus { OPEN = 'open', INVESTIGATING = 'investigating', IDENTIFIED = 'identified', MITIGATING = 'mitigating', RESOLVED = 'resolved', CLOSED = 'closed' }
export enum TimelineEntryType { STATUS_CHANGE = 'status_change', NOTE = 'note', ESCALATION = 'escalation', NOTIFICATION = 'notification', ACTION = 'action' }
export enum EscalationLevel { L1 = 'l1', L2 = 'l2', L3 = 'l3', MANAGEMENT = 'management', EXECUTIVE = 'executive' }

@Entity('incident')
@Index(['workspaceId', 'status'])
@Index(['workspaceId', 'severity'])
export class IncidentEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ nullable: false }) title: string;
  @Column({ type: 'text', nullable: true }) description: string;
  @Column({ type: 'enum', enum: IncidentSeverity, default: IncidentSeverity.SEV3 }) severity: IncidentSeverity;
  @Column({ type: 'enum', enum: IncidentStatus, default: IncidentStatus.OPEN }) status: IncidentStatus;
  @Column({ nullable: true }) assigneeId: string;
  @Column({ type: 'varchar', length: 100, nullable: true }) service: string;
  @Column({ type: 'varchar', length: 100, nullable: true }) component: string;
  @Column({ type: 'simple-json', nullable: true }) affectedAccounts: string[];
  @Column({ type: 'int', default: 0 }) affectedUsersCount: number;
  @Column({ type: 'varchar', length: 500, nullable: true }) slackChannel: string;
  @Column({ type: 'varchar', length: 500, nullable: true }) statusPageUrl: string;
  @Column({ type: 'timestamp', nullable: true }) detectedAt: Date;
  @Column({ type: 'timestamp', nullable: true }) acknowledgedAt: Date;
  @Column({ type: 'timestamp', nullable: true }) mitigatedAt: Date;
  @Column({ type: 'timestamp', nullable: true }) resolvedAt: Date;
  @Column({ type: 'int', nullable: true }) timeToAcknowledgeMinutes: number;
  @Column({ type: 'int', nullable: true }) timeToResolveMinutes: number;
  @Column({ type: 'text', nullable: true }) rootCause: string;
  @Column({ type: 'text', nullable: true }) resolution: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

@Entity('incident_timeline')
@Index(['workspaceId', 'incidentId'])
export class IncidentTimelineEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ nullable: false }) incidentId: string;
  @Column({ type: 'enum', enum: TimelineEntryType, default: TimelineEntryType.NOTE }) entryType: TimelineEntryType;
  @Column({ type: 'text', nullable: false }) content: string;
  @Column({ nullable: true }) authorId: string;
  @Column({ type: 'varchar', length: 100, nullable: true }) authorName: string;
  @Column({ type: 'varchar', length: 50, nullable: true }) previousStatus: string;
  @Column({ type: 'varchar', length: 50, nullable: true }) newStatus: string;
  @Column({ type: 'boolean', default: false }) isPublic: boolean;
  @CreateDateColumn() createdAt: Date;
}

@Entity('postmortem')
@Index(['workspaceId', 'incidentId'])
export class PostmortemEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ nullable: false }) incidentId: string;
  @Column({ nullable: false }) title: string;
  @Column({ type: 'text', nullable: true }) summary: string;
  @Column({ type: 'text', nullable: true }) impact: string;
  @Column({ type: 'text', nullable: true }) rootCauseAnalysis: string;
  @Column({ type: 'text', nullable: true }) timeline: string;
  @Column({ type: 'simple-json', nullable: true }) actionItems: Array<{ description: string; owner: string; dueDate: string; status: string }>;
  @Column({ type: 'simple-json', nullable: true }) lessonsLearned: string[];
  @Column({ type: 'varchar', length: 20, default: 'draft' }) status: string;
  @Column({ nullable: true }) authorId: string;
  @Column({ type: 'simple-json', nullable: true }) reviewers: string[];
  @Column({ type: 'timestamp', nullable: true }) publishedAt: Date;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

@Entity('escalation_policy')
@Index(['workspaceId'])
export class EscalationPolicyEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ nullable: false }) name: string;
  @Column({ type: 'text', nullable: true }) description: string;
  @Column({ type: 'varchar', length: 100, nullable: true }) service: string;
  @Column({ type: 'simple-json', nullable: true }) levels: Array<{ level: string; notifyUserIds: string[]; escalateAfterMinutes: number; channels: string[] }>;
  @Column({ type: 'boolean', default: true }) isActive: boolean;
  @Column({ type: 'int', nullable: true }) autoEscalateMinutes: number;
  @Column({ type: 'simple-json', nullable: true }) notificationChannels: string[];
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
