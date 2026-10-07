import { type AgentRunSummary } from 'twenty-shared/ai';
import { type AgentRunStatus } from 'twenty-shared/application';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { CREATE_AGENT_RUN_SUSPENSION_TABLE_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-46/create-agent-run-suspension-table-upgrade-command-name.constant';
import { RENAME_AGENT_RUN_SUSPENSION_TO_AGENT_RUN_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-46/rename-agent-run-suspension-to-agent-run-upgrade-command-name.constant';
import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { WasRenamedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-renamed-in-upgrade.decorator';
import { type AgentRunCaller } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller.type';
import { type AgentRunSpec } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-spec.type';
import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity.type';

// An agent run from its start to its outcome. Only a suspended run holds its conversation, as it waits
// on one thing at a time; a running one is serialized by the thread lock, so a crash leaving it
// RUNNING blocks nothing
@Entity({ name: 'agentRun', schema: 'core' })
@WasIntroducedInUpgrade({
  upgradeCommandName: CREATE_AGENT_RUN_SUSPENSION_TABLE_UPGRADE_COMMAND_NAME,
})
@WasRenamedInUpgrade([
  {
    previousName: 'agentRunSuspension',
    upgradeCommandName:
      RENAME_AGENT_RUN_SUSPENSION_TO_AGENT_RUN_UPGRADE_COMMAND_NAME,
  },
])
@Index('IDX_AGENT_RUN_SUSPENDED_THREAD_ID_UNIQUE', ['threadId'], {
  unique: true,
  where: `"status" = 'SUSPENDED'`,
})
export class AgentRunEntity extends WorkspaceRelatedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  threadId: string;

  @Column({ type: 'jsonb' })
  caller: AgentRunCaller;

  // null when the caller posted the awaited call itself: the answer is its outcome
  @Column({ type: 'jsonb', nullable: true })
  runSpec: AgentRunSpec | null;

  @Column({ type: 'varchar' })
  @WasIntroducedInUpgrade({
    upgradeCommandName:
      RENAME_AGENT_RUN_SUSPENSION_TO_AGENT_RUN_UPGRADE_COMMAND_NAME,
  })
  status: AgentRunStatus;

  @Column({ type: 'jsonb', nullable: true })
  @WasIntroducedInUpgrade({
    upgradeCommandName:
      RENAME_AGENT_RUN_SUSPENSION_TO_AGENT_RUN_UPGRADE_COMMAND_NAME,
  })
  outcome: { result: object } | { error: string } | null;

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
