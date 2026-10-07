import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { CREATE_AGENT_RUN_SUSPENSION_TABLE_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-46/create-agent-run-suspension-table-upgrade-command-name.constant';
import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { type AgentRunCaller } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller.type';
import { type AgentRunSpec } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-spec.type';
import { type AgentRunSummary } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-summary.type';
import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity.type';

// A run paused on an answer or a wait, kept until the engine continues it and hands its
// outcome to the caller. A conversation holds one at a time, as it waits on one thing at a time
@Entity({ name: 'agentRunSuspension', schema: 'core' })
@WasIntroducedInUpgrade({
  upgradeCommandName: CREATE_AGENT_RUN_SUSPENSION_TABLE_UPGRADE_COMMAND_NAME,
})
@Unique('UQ_AGENT_RUN_SUSPENSION_THREAD_ID', ['threadId'])
export class AgentRunSuspensionEntity extends WorkspaceRelatedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  threadId: string;

  @Column({ type: 'jsonb' })
  caller: AgentRunCaller;

  // null when the caller posted the awaited call itself: the answer is its outcome
  @Column({ type: 'jsonb', nullable: true })
  runSpec: AgentRunSpec | null;

  // summed across the run's segments, so the caller gets one total
  @Column({ type: 'jsonb', nullable: true })
  summary: AgentRunSummary | null;

  @Column({ type: 'integer', default: 0 })
  resumeCount: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
