import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

import { AgentTurnEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-turn.entity';

@Entity('agentTurnEvaluation')
export class AgentTurnEvaluationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  @Index()
  turnId: string;

  @ManyToOne(() => AgentTurnEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'turnId' })
  turn: Relation<AgentTurnEntity>;

  @Column({ type: 'int' })
  score: number;

  @Column({ type: 'text', nullable: true })
  comment: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
