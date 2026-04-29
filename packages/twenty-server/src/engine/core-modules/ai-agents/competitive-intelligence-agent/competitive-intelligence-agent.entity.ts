import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { WorkspaceEntity } from '../../workspace/workspace.entity';

export enum CIAgentStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  STOPPED = 'STOPPED',
}

@Entity('ai_agents_competitive_intelligence')
export class CompetitiveIntelligenceAgent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  workspaceId: string;

  @ManyToOne(() => WorkspaceEntity, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workspaceId' })
  workspace: WorkspaceEntity;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: CIAgentStatus, default: CIAgentStatus.PAUSED })
  status: CIAgentStatus;

  @Column({ type: 'jsonb', nullable: true })
  competitorList: Array<{ name: string; domain: string; priority: number }>;

  @Column({ type: 'jsonb', nullable: true })
  monitoringSources: Array<{ type: string; url?: string; keywords?: string[] }>;

  @Column({ type: 'int', default: 24 })
  checkIntervalHours: number;

  @Column({ type: 'jsonb', nullable: true })
  battleCards: Record<string, {
    strengths: string[];
    weaknesses: string[];
    differentiators: string[];
    commonObjections: string[];
    winStrategy: string;
    lastUpdated: string;
  }>;

  @Column({ type: 'int', default: 0 })
  alertsGenerated: number;

  @Column({ type: 'int', default: 0 })
  battleCardsUpdated: number;

  @Column({ nullable: true })
  lastRunAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
