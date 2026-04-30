import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum SessionStatus { SCHEDULED = 'scheduled', IN_PROGRESS = 'in_progress', COMPLETED = 'completed', CANCELLED = 'cancelled' }
export enum CallOutcome { WON = 'won', LOST = 'lost', FOLLOW_UP = 'follow_up', NO_DECISION = 'no_decision', DEMO_SCHEDULED = 'demo_scheduled' }
export enum SkillCategory { DISCOVERY = 'discovery', OBJECTION_HANDLING = 'objection_handling', CLOSING = 'closing', PRESENTATION = 'presentation', NEGOTIATION = 'negotiation', RAPPORT = 'rapport' }
export enum GapSeverity { CRITICAL = 'critical', HIGH = 'high', MEDIUM = 'medium', LOW = 'low' }

@Entity('coaching_session')
@Index(['workspaceId'])
@Index(['workspaceId', 'repId'])
export class CoachingSessionEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ nullable: false }) repId: string;
  @Column({ nullable: true }) coachId: string;
  @Column({ nullable: false }) title: string;
  @Column({ type: 'text', nullable: true }) agenda: string;
  @Column({ type: 'enum', enum: SessionStatus, default: SessionStatus.SCHEDULED }) status: SessionStatus;
  @Column({ type: 'timestamp', nullable: true }) scheduledAt: Date;
  @Column({ type: 'int', nullable: true }) durationMinutes: number;
  @Column({ type: 'text', nullable: true }) coachNotes: string;
  @Column({ type: 'text', nullable: true }) repNotes: string;
  @Column({ type: 'simple-json', nullable: true }) actionItems: Array<{ description: string; dueDate: string; completed: boolean }>;
  @Column({ type: 'simple-json', nullable: true }) focusAreas: string[];
  @Column({ type: 'float', nullable: true }) overallRating: number;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

@Entity('call_review')
@Index(['workspaceId', 'repId'])
export class CallReviewEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ nullable: false }) repId: string;
  @Column({ nullable: true }) reviewerId: string;
  @Column({ nullable: true }) dealId: string;
  @Column({ type: 'varchar', length: 255, nullable: true }) callTitle: string;
  @Column({ type: 'timestamp', nullable: true }) callDate: Date;
  @Column({ type: 'int', nullable: true }) callDurationMinutes: number;
  @Column({ type: 'enum', enum: CallOutcome, nullable: true }) outcome: CallOutcome;
  @Column({ type: 'float', nullable: true }) talkRatio: number;
  @Column({ type: 'int', nullable: true }) questionsAsked: number;
  @Column({ type: 'float', nullable: true }) discoveryScore: number;
  @Column({ type: 'float', nullable: true }) objectionHandlingScore: number;
  @Column({ type: 'float', nullable: true }) closingScore: number;
  @Column({ type: 'float', nullable: true }) presentationScore: number;
  @Column({ type: 'float', nullable: true }) overallScore: number;
  @Column({ type: 'text', nullable: true }) strengths: string;
  @Column({ type: 'text', nullable: true }) improvements: string;
  @Column({ type: 'text', nullable: true }) feedback: string;
  @Column({ type: 'simple-json', nullable: true }) keyMoments: Array<{ timestamp: string; description: string; sentiment: string }>;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

@Entity('rep_scorecard')
@Index(['workspaceId', 'repId'])
export class RepScorecardEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ nullable: false }) repId: string;
  @Column({ type: 'varchar', length: 20, nullable: true }) period: string;
  @Column({ type: 'date', nullable: true }) periodStart: Date;
  @Column({ type: 'date', nullable: true }) periodEnd: Date;
  @Column({ type: 'float', default: 0 }) overallScore: number;
  @Column({ type: 'float', default: 0 }) discoveryScore: number;
  @Column({ type: 'float', default: 0 }) objectionScore: number;
  @Column({ type: 'float', default: 0 }) closingScore: number;
  @Column({ type: 'float', default: 0 }) presentationScore: number;
  @Column({ type: 'float', default: 0 }) negotiationScore: number;
  @Column({ type: 'float', default: 0 }) rapportScore: number;
  @Column({ type: 'int', default: 0 }) callsReviewed: number;
  @Column({ type: 'int', default: 0 }) sessionsCompleted: number;
  @Column({ type: 'float', nullable: true }) quotaAttainment: number;
  @Column({ type: 'float', nullable: true }) winRate: number;
  @Column({ type: 'float', nullable: true }) avgDealSize: number;
  @Column({ type: 'int', nullable: true }) teamRank: number;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

@Entity('skill_gap')
@Index(['workspaceId', 'repId'])
export class SkillGapEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ nullable: false }) repId: string;
  @Column({ type: 'enum', enum: SkillCategory, default: SkillCategory.DISCOVERY }) category: SkillCategory;
  @Column({ type: 'enum', enum: GapSeverity, default: GapSeverity.MEDIUM }) severity: GapSeverity;
  @Column({ type: 'text', nullable: true }) description: string;
  @Column({ type: 'float', default: 0 }) currentLevel: number;
  @Column({ type: 'float', default: 0 }) targetLevel: number;
  @Column({ type: 'float', default: 0 }) gapSize: number;
  @Column({ type: 'simple-json', nullable: true }) recommendedTraining: string[];
  @Column({ type: 'simple-json', nullable: true }) relatedCallIds: string[];
  @Column({ type: 'boolean', default: false }) isResolved: boolean;
  @Column({ type: 'timestamp', nullable: true }) resolvedAt: Date;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
