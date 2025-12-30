import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { AgentMessageEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';
import { AgentTurnEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-turn.entity';

@Entity('agentChatThread')
export class AgentChatThreadEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'uuid' })
  @Index()
  userWorkspaceId: string;

  @ManyToOne(() => UserWorkspaceEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userWorkspaceId' })
  userWorkspace: Relation<UserWorkspaceEntity>;

  @Column({ nullable: true, type: 'varchar' })
  title: string;

  @Column({ type: 'int', default: 0 })
  totalInputTokens: number;

  @Column({ type: 'int', default: 0 })
  totalOutputTokens: number;

  @Column({ type: 'int', nullable: true })
  contextWindowTokens: number | null;

  @Column({ type: 'bigint', default: 0 })
  totalInputCredits: number;

  @Column({ type: 'bigint', default: 0 })
  totalOutputCredits: number;

  @OneToMany(() => AgentTurnEntity, (turn) => turn.thread)
  turns: Relation<AgentTurnEntity[]>;

  @OneToMany(() => AgentMessageEntity, (message) => message.thread)
  messages: Relation<AgentMessageEntity[]>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
