import { Injectable } from '@nestjs/common';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { type QueryRunner } from 'typeorm';

import { AGENT_HISTORY_TABLES } from 'src/database/commands/agent-history/agent-history-tables.constant';
import { getAgentHistoryColumn } from 'src/database/commands/agent-history/utils/get-agent-history-column.util';
import { getAgentHistoryMigrationColumns } from 'src/database/commands/agent-history/utils/get-agent-history-migration-columns.util';
import { getAgentHistoryTable } from 'src/database/commands/agent-history/utils/get-agent-history-table.util';
import { type AgentHistoryStorageState } from 'src/engine/metadata-modules/ai/ai-history/types/agent-history-storage-state.type';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

type Storage = AgentHistoryStorageState['storage'];

@Injectable()
export class AgentHistoryMigrationValidationService {
  // agentChatThreadTarget rows point at the workspace-schema thread table. A
  // rollback leaves that store in place, but the next forward migration clears
  // it, cascading the links away with no way to rebuild them from core. Refuse
  // instead of losing them silently.
  async assertNoThreadTargets({
    runner,
    workspaceId,
  }: {
    runner: QueryRunner;
    workspaceId: string;
  }): Promise<void> {
    const table = `${escapeIdentifier(getWorkspaceSchemaName(workspaceId))}."agentChatThreadTarget"`;

    const [{ exists }]: { exists: boolean }[] = await runner.query(
      'SELECT to_regclass($1) IS NOT NULL AS exists',
      [table],
    );

    if (!exists) {
      return;
    }

    // A custom object leg is set to null when its record is destroyed, as on
    // noteTarget, so such a row links nothing and there is no record left to
    // detach it from. Every leg's column is target<Object>Id, whatever the
    // object, which finds the legs without reading the metadata.
    const rows: { id: string }[] = await runner.query(
      `SELECT target.id FROM ${table} target
       WHERE target."deletedAt" IS NULL
         AND EXISTS (
           SELECT 1 FROM jsonb_each(to_jsonb(target)) leg
           WHERE leg.key LIKE 'target%Id' AND leg.value <> 'null'::jsonb
         )
       LIMIT 1`,
    );

    if (isNonEmptyArray(rows)) {
      throw new Error(
        'Records are still linked to chat threads in this workspace. Detach them before rolling agent history back to core.',
      );
    }
  }

  async assertNoCoreIdCollisions({
    runner,
    workspaceId,
  }: {
    runner: QueryRunner;
    workspaceId: string;
  }): Promise<void> {
    for (const table of AGENT_HISTORY_TABLES) {
      const [{ collision }] = await runner.query(
        `SELECT EXISTS (SELECT 1 FROM ${getAgentHistoryTable({ workspaceId, storage: 'workspace', name: table.name })} source JOIN core.${escapeIdentifier(table.name)} target USING (id) WHERE target."workspaceId" <> $1) AS collision`,
        [workspaceId],
      );
      if (collision) {
        throw new Error(
          `Core ${table.name} contains IDs owned by another workspace`,
        );
      }
    }
  }

  async assertNoActiveStreams({
    runner,
    workspaceId,
    source,
  }: {
    runner: QueryRunner;
    workspaceId: string;
    source: Storage;
  }): Promise<void> {
    const rows: { id: string }[] = await runner.query(
      `SELECT id FROM ${getAgentHistoryTable({ workspaceId, storage: source, name: 'agentChatThread' })} WHERE "activeStreamId" IS NOT NULL ${source === 'core' ? 'AND "workspaceId" = $1' : ''} LIMIT 1`,
      source === 'core' ? [workspaceId] : [],
    );
    if (isNonEmptyArray(rows)) {
      throw new Error(
        'Agent streams are still active. Drain or cancel them before migrating',
      );
    }
  }

  async verify({
    runner,
    workspaceId,
  }: {
    runner: QueryRunner;
    workspaceId: string;
  }): Promise<void> {
    for (const table of AGENT_HISTORY_TABLES) {
      const coreColumns = await getAgentHistoryMigrationColumns({
        runner,
        table,
      });
      const columns = table.columns
        .map((column) =>
          coreColumns.includes(column)
            ? escapeIdentifier(column)
            : `NULL::uuid AS ${escapeIdentifier(column)}`,
        )
        .join(', ');
      const targetColumns = table.columns
        .map(
          (column) =>
            `${escapeIdentifier(getAgentHistoryColumn({ tableName: table.name, storage: 'workspace', columnName: column }))} AS ${escapeIdentifier(column)}`,
        )
        .join(', ');
      const [{ mismatch }]: { mismatch: boolean }[] = await runner.query(
        `
        SELECT EXISTS (
          SELECT 1 FROM (SELECT ${columns} FROM core.${escapeIdentifier(table.name)} WHERE "workspaceId" = $1) source
          FULL JOIN (SELECT ${targetColumns} FROM ${getAgentHistoryTable({ workspaceId, storage: 'workspace', name: table.name })}) target USING (id)
          WHERE to_jsonb(source) IS DISTINCT FROM to_jsonb(target)
        ) AS mismatch`,
        [workspaceId],
      );
      if (mismatch) {
        throw new Error(
          `Agent history verification failed for ${table.name}; workspace remains fenced`,
        );
      }
    }
  }

  async validateSchema({
    runner,
    workspaceId,
  }: {
    runner: QueryRunner;
    workspaceId: string;
  }): Promise<void> {
    for (const table of AGENT_HISTORY_TABLES) {
      const rows: { column_name: string }[] = await runner.query(
        'SELECT column_name FROM information_schema.columns WHERE table_schema = $1 AND table_name = $2',
        ['core', table.name],
      );
      const coreColumns = await getAgentHistoryMigrationColumns({
        runner,
        table,
      });
      const expected = new Set<string>([...coreColumns, 'workspaceId']);
      if (
        rows.length !== expected.size ||
        rows.some((row) => !expected.has(row.column_name))
      ) {
        throw new Error(
          `Legacy ${table.name} columns have changed; update the migration before proceeding`,
        );
      }
      const targetRows: { column_name: string }[] = await runner.query(
        'SELECT column_name FROM information_schema.columns WHERE table_schema = $1 AND table_name = $2',
        [getWorkspaceSchemaName(workspaceId), table.name],
      );
      const targetColumns = new Set(targetRows.map((row) => row.column_name));
      if (
        table.columns.some(
          (column) =>
            !targetColumns.has(
              getAgentHistoryColumn({
                tableName: table.name,
                storage: 'workspace',
                columnName: column,
              }),
            ),
        )
      ) {
        throw new Error(`Workspace ${table.name} schema is not prepared`);
      }
      const missingCoreColumns = table.columns.filter(
        (column) => !coreColumns.includes(column),
      );
      if (isNonEmptyArray(missingCoreColumns)) {
        const attributedMessages = await runner.query(
          `SELECT 1 FROM ${getAgentHistoryTable({ workspaceId, storage: 'workspace', name: table.name })} WHERE ${missingCoreColumns.map((column) => `${escapeIdentifier(column)} IS NOT NULL`).join(' OR ')} LIMIT 1`,
        );
        if (isNonEmptyArray(attributedMessages)) {
          throw new Error(
            'Run the 2.43 instance upgrade before moving attributed chat history to core',
          );
        }
      }
    }
  }

  async validateReferences({
    runner,
    workspaceId,
    storage,
  }: {
    runner: QueryRunner;
    workspaceId: string;
    storage: Storage;
  }): Promise<void> {
    // Workspace TEXT fields must remain reversible to the deployed core enums.
    const invalidMessages: { id: string }[] = await runner.query(
      `SELECT id FROM ${getAgentHistoryTable({ workspaceId, storage, name: 'agentMessage' })}
       WHERE (role::text <> ALL(enum_range(NULL::core."agentMessage_role_enum")::text[])
         OR status::text <> ALL(enum_range(NULL::core."agentMessage_status_enum")::text[]))
         ${storage === 'core' ? 'AND "workspaceId" = $1' : ''} LIMIT 1`,
      storage === 'core' ? [workspaceId] : [],
    );
    if (isNonEmptyArray(invalidMessages)) {
      throw new Error(
        `Agent message ${invalidMessages[0].id} has a role or status unsupported by core storage`,
      );
    }

    for (const [child, column, parent] of [
      ['agentChatThread', 'userWorkspaceId', 'userWorkspace'],
      ['agentMessagePart', 'fileId', 'file'],
    ]) {
      const [{ invalid }] = await runner.query(
        `SELECT EXISTS (
        SELECT 1 FROM ${getAgentHistoryTable({ workspaceId, storage, name: child })} child
        LEFT JOIN core.${escapeIdentifier(parent)} parent ON parent.id = child.${escapeIdentifier(column)} AND parent."workspaceId" = $1
        WHERE child.${escapeIdentifier(column)} IS NOT NULL AND parent.id IS NULL ${storage === 'core' ? 'AND child."workspaceId" = $1' : ''}
      ) AS invalid`,
        [workspaceId],
      );
      if (invalid) {
        throw new Error(
          `Invalid or cross-workspace ${child}.${column} reference`,
        );
      }
    }
    const [{ inconsistentTurn }] = await runner.query(
      `SELECT EXISTS (
      SELECT 1 FROM ${getAgentHistoryTable({ workspaceId, storage, name: 'agentMessage' })} message
      JOIN ${getAgentHistoryTable({ workspaceId, storage, name: 'agentTurn' })} turn ON turn.id = message."turnId"
      WHERE message."threadId" IS DISTINCT FROM turn."threadId" ${storage === 'core' ? 'AND message."workspaceId" = $1' : ''}
    ) AS "inconsistentTurn"`,
      storage === 'core' ? [workspaceId] : [],
    );
    if (inconsistentTurn) {
      throw new Error('A message and its turn belong to different threads');
    }
    for (const [child, column, parent] of [
      ['agentTurn', 'threadId', 'agentChatThread'],
      ['agentMessage', 'threadId', 'agentChatThread'],
      ['agentMessage', 'turnId', 'agentTurn'],
      ['agentMessagePart', 'messageId', 'agentMessage'],
      ['agentTurnEvaluation', 'turnId', 'agentTurn'],
    ]) {
      const [{ invalid }]: { invalid: boolean }[] = await runner.query(
        `SELECT EXISTS (
        SELECT 1 FROM ${getAgentHistoryTable({ workspaceId, storage, name: child })} child
        LEFT JOIN ${getAgentHistoryTable({ workspaceId, storage, name: parent })} parent ON parent.id = child.${escapeIdentifier(column)} ${storage === 'core' ? 'AND parent."workspaceId" = $1' : ''}
        WHERE child.${escapeIdentifier(column)} IS NOT NULL AND parent.id IS NULL ${storage === 'core' ? 'AND child."workspaceId" = $1' : ''}
      ) AS invalid`,
        storage === 'core' ? [workspaceId] : [],
      );
      if (invalid) {
        throw new Error(
          `Invalid or cross-workspace ${child}.${column} reference`,
        );
      }
    }
  }
}
