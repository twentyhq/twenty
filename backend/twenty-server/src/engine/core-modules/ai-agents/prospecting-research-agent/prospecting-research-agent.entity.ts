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

export enum ResearchAgentStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  STOPPED = 'STOPPED',
}

@Entity('ai_agents_prospecting_research')
export class ProspectingResearchAgent {
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
  description: string | null;

  @Column({ type: 'enum', enum: ResearchAgentStatus, default: ResearchAgentStatus.PAUSED })
  status: ResearchAgentStatus;

  @Column({ default: true })
  newsMonitoringEnabled: boolean;

  @Column({ default: true })
  linkedInMonitoringEnabled: boolean;

  @Column({ default: true })
  triggerEventsEnabled: boolean;

  @Column({ type: 'jsonb', nullable: true })
  sources: string[] | null;

  @Column({ type: 'jsonb', nullable: true })
  triggers: Record<string, unknown> | null;

  @Column({ type: 'int', default: 0 })
  researchesCompletedCount: number;

  @Column({ type: 'int', default: 0 })
  triggersDetectedCount: number;

  @Column({ nullable: true })
  lastResearchAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('ai_prospect_research')
export class ProspectResearch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  workspaceId: string;

  @ManyToOne(() => WorkspaceEntity, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workspaceId' })
  workspace: WorkspaceEntity;

  @Column({ nullable: true })
  companyId: string | null;

  @Column({ nullable: true })
  contactId: string | null;

  @Column({ nullable: true })
  companyName: string | null;

  @Column({ type: 'text', nullable: true })
  companyDescription: string | null;

  @Column({ type: 'jsonb', nullable: true })
  news: Record<string, unknown>[] | null;

  @Column({ type: 'jsonb', nullable: true })
  fundingRounds: Record<string, unknown>[] | null;

  @Column({ type: 'jsonb', nullable: true })
  hiringMoves: Record<string, unknown>[] | null;

  @Column({ type: 'jsonb', nullable: true })
  intentSignals: string[] | null;

  @Column({ type: 'text', nullable: true })
  briefGenerated: string | null;

  @Column({ default: false })
  isNewInformation: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
