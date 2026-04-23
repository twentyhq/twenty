import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

export enum ActionType {
  EMAIL = 'email',
  CALL = 'call',
  MEETING = 'meeting',
  TASK = 'task',
  SEQUENCE = 'sequence',
  SCORING = 'scoring',
}

export enum NBAPriority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

@Entity('next_best_action_config')
@Index(['workspaceId'])
export class NextBestActionConfigEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @Column({ type: 'boolean', default: true })
  enabled: boolean;

  @Column({ type: 'simple-json', nullable: true })
  actionWeights: Record<string, number>;

  @Column({ type: 'int', default: 3 })
  maxActionsPerDay: number;

  @Column({ type: 'simple-array', nullable: true })
  excludedActionTypes: ActionType[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastComputedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('next_best_action')
@Index(['workspaceId', 'recordId', 'priority'])
export class NextBestActionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @Column({ nullable: false })
  recordId: string;

  @Column({ nullable: false })
  recordType: string;

  @Column({ nullable: false })
  recordName: string;

  @Column({ type: 'enum', enum: ActionType, nullable: false })
  actionType: ActionType;

  @Column({ type: 'text', nullable: false })
  actionDescription: string;

  @Column({ type: 'text', nullable: true })
  actionDetails: string;

  @Column({ type: 'float', nullable: false })
  score: number;

  @Column({ type: 'enum', enum: NBAPriority, nullable: false })
  priority: NBAPriority;

  @Column({ type: 'timestamp', nullable: true })
  scheduledAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'boolean', default: false })
  completed: boolean;

  @Column({ nullable: true })
  completedBy: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  generatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  dismissedAt: Date;
}

@Entity('action_outcome_log')
@Index(['workspaceId', 'actionId', 'createdAt'])
export class ActionOutcomeLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @Column({ nullable: false })
  actionId: string;

  @Column({ type: 'enum', enum: ActionType, nullable: false })
  actionType: ActionType;

  @Column({ type: 'float', nullable: false })
  predictedScore: number;

  @Column({ type: 'float', nullable: true })
  actualOutcome: number;

  @Column({ type: 'boolean', default: false })
  converted: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;
}
