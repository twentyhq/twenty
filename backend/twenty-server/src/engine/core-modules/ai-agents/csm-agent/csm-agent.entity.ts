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

export enum CsmAgentStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  STOPPED = 'STOPPED',
}

export enum CsmAgentTrigger {
  HEALTH_SCORE_DROP = 'HEALTH_SCORE_DROP',
  RENEWAL_APPROACHING = 'RENEWAL_APPROACHING',
  LOW_ENGAGEMENT = 'LOW_ENGAGEMENT',
  NPS_RESPONSE = 'NPS_RESPONSE',
  QUARTER_END = 'QUARTER_END',
}

@Entity('ai_agents_csm')
export class CsmAgent {
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

  @Column({ type: 'enum', enum: CsmAgentStatus, default: CsmAgentStatus.PAUSED })
  status: CsmAgentStatus;

  @Column({ type: 'jsonb', nullable: true })
  triggerConfig: Record<string, unknown>;

  @Column({ type: 'int', default: 80 })
  healthScoreThreshold: number;

  @Column({ type: 'int', default: 30 })
  renewalDaysBefore: number;

  @Column({ type: 'jsonb', nullable: true })
  playbookTemplates: Record<string, unknown>[];

  @Column({ default: true })
  autoEscalationEnabled: boolean;

  @Column({ nullable: true })
  escalationChannel: string;

  @Column({ type: 'int', default: 0 })
  playbooksTriggeredCount: number;

  @Column({ type: 'int', default: 0 })
  renewalsManagedCount: number;

  @Column({ type: 'int', default: 0 })
  churnPreventedCount: number;

  @Column({ nullable: true })
  lastRunAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
