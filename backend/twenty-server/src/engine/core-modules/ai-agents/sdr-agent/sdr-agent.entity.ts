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

export enum SdrAgentStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  STOPPED = 'STOPPED',
}

export enum SdrAgentTaskType {
  PROSPECT = 'PROSPECT',
  QUALIFY = 'QUALIFY',
  OUTREACH = 'OUTREACH',
  FOLLOW_UP = 'FOLLOW_UP',
}

@Entity('ai_agents_sdr')
export class SdrAgent {
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

  @Column({ type: 'enum', enum: SdrAgentStatus, default: SdrAgentStatus.PAUSED })
  status: SdrAgentStatus;

  @Column({ nullable: true })
  targetDatabaseId: string;

  @Column({ nullable: true })
  outreachChannel: string;

  @Column({ type: 'int', default: 10 })
  dailyOutreachLimit: number;

  @Column({ type: 'int', default: 0 })
  outreachCountToday: number;

  @Column({ nullable: true })
  icpCriteria: string;

  @Column({ type: 'jsonb', nullable: true })
  personaConfig: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  sequenceConfig: Record<string, unknown>;

  @Column({ nullable: true })
  handoffThreshold: string;

  @Column({ type: 'int', default: 0 })
  qualifiedLeadsCount: number;

  @Column({ type: 'int', default: 0 })
  meetingsBookedCount: number;

  @Column({ type: 'int', default: 0 })
  responseRate: number;

  @Column({ nullable: true })
  lastRunAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
