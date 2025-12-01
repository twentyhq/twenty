import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

import { AgentMessageEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';
import { AgentTurnEvaluationEntity } from 'src/engine/metadata-modules/ai/ai-agent-monitor/entities/agent-turn-evaluation.entity';
import { AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';

@Entity('agentTurn')
export class AgentTurnEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  @Index()
  threadId: string;

  @ManyToOne(() => AgentChatThreadEntity, (thread) => thread.turns, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'threadId' })
  thread: Relation<AgentChatThreadEntity>;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  agentId: string | null;

  @OneToMany(() => AgentMessageEntity, (message) => message.turn)
  messages: Relation<AgentMessageEntity[]>;

  @OneToMany(() => AgentTurnEvaluationEntity, (evaluation) => evaluation.turn)
  evaluations: Relation<AgentTurnEvaluationEntity[]>;

  @CreateDateColumn()
  createdAt: Date;
}
