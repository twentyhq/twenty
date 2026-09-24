import { Injectable } from '@nestjs/common';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { type QueryRunner } from 'typeorm';

import { AGENT_HISTORY_TABLES } from 'src/database/commands/agent-history/agent-history-tables.constant';
import { getAgentHistoryColumn } from 'src/database/commands/agent-history/utils/get-agent-history-column.util';
import { getAgentHistoryMigrationColumns } from 'src/database/commands/agent-history/utils/get-agent-history-migration-columns.util';
import { getAgentHistoryTable } from 'src/database/commands/agent-history/utils/get-agent-history-table.util';
import { type AgentHistoryStorageState } from 'src/engine/metadata-modules/ai/ai-history/types/agent-history-storage-state.type';
import {
  buildUserWorkspaceIdFromWorkspaceMemberIdSql,
  buildWorkspaceMemberIdFromUserWorkspaceIdSql,
} from 'src/engine/metadata-modules/ai/ai-history/utils/build-agent-chat-thread-owner-sql.util';
import { getAgentChatThreadOwnerColumn } from 'src/engine/metadata-modules/ai/ai-history/utils/get-agent-chat-thread-owner-column.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

type Storage = AgentHistoryStorageState['storage'];
type HistoryTable = (typeof AGENT_HISTORY_TABLES)[number];

@Injectable()
export class AgentHistoryMigrationDataService {
  async clearStore({
    runner,
    workspaceId,
    storage,
  }: {
    runner: QueryRunner;
    workspaceId: string;
    storage: Storage;
  }): Promise<void> {
    for (const table of [...AGENT_HISTORY_TABLES].reverse()) {
      let rows: { id: string }[];
      do {
        rows = await runner.query(
          `WITH batch AS (SELECT id FROM ${getAgentHistoryTable({ workspaceId, storage, name: table.name })} ${storage === 'core' ? 'WHERE "workspaceId" = $1' : ''} ORDER BY id LIMIT 1000),
           deleted AS (DELETE FROM ${getAgentHistoryTable({ workspaceId, storage, name: table.name })} target USING batch WHERE target.id = batch.id RETURNING target.id)
           SELECT id FROM deleted`,
          storage === 'core' ? [workspaceId] : [],
        );
      } while (isNonEmptyArray(rows));
    }
  }

  async copyBatch({
    runner,
    workspaceId,
    table,
    source,
    target,
    lastId,
    batchSize,
  }: {
    runner: QueryRunner;
    workspaceId: string;
    table: HistoryTable;
    source: Storage;
    target: Storage;
    lastId: string | null;
    batchSize: number;
  }): Promise<string[]> {
    const columns = await getAgentHistoryMigrationColumns({ runner, table });
    const workspaceOwnerColumn = await getAgentChatThreadOwnerColumn({
      manager: runner,
      workspaceId,
      storage: 'workspace',
    });
    const isMemberOwned =
      table.name === 'agentChatThread' &&
      workspaceOwnerColumn === 'workspaceMemberId';
    const targetColumns = [
      ...columns.map((column) =>
        getAgentHistoryColumn({
          tableName: table.name,
          storage: target,
          columnName: column,
          workspaceOwnerColumn,
        }),
      ),
      ...(target === 'core' ? ['workspaceId'] : []),
    ];
    const selection = columns.map((column) => {
      const quoted = escapeIdentifier(
        getAgentHistoryColumn({
          tableName: table.name,
          storage: source,
          columnName: column,
          workspaceOwnerColumn,
        }),
      );
      if (isMemberOwned && column === 'userWorkspaceId') {
        const owner =
          target === 'workspace'
            ? buildWorkspaceMemberIdFromUserWorkspaceIdSql({
                workspaceId,
                userWorkspaceIdSql: `batch.${quoted}`,
              })
            : buildUserWorkspaceIdFromWorkspaceMemberIdSql({
                workspaceId,
                workspaceMemberIdSql: `batch.${quoted}`,
                workspaceIdSql: '$1::uuid',
              });
        return `${owner} AS ${escapeIdentifier(column)}`;
      }
      if (
        target === 'core' &&
        table.name === 'agentMessage' &&
        ['role', 'status'].includes(column)
      ) {
        return `${quoted}::text::"core".${escapeIdentifier(`agentMessage_${column}_enum`)}`;
      }
      return table.name === 'agentMessage' &&
        ['role', 'status'].includes(column)
        ? `${quoted}::text`
        : quoted;
    });
    if (target === 'core') {
      selection.push('$1::uuid');
    }
    const rows: { id: string; copied: boolean }[] = await runner.query(
      `
      WITH batch AS (
        SELECT * FROM ${getAgentHistoryTable({ workspaceId, storage: source, name: table.name })}
        WHERE ($2::uuid IS NULL OR id > $2) ${source === 'core' ? 'AND "workspaceId" = $1' : ''}
        ORDER BY id LIMIT $3
      ), copied AS (
        INSERT INTO ${getAgentHistoryTable({ workspaceId, storage: target, name: table.name })} AS destination (${targetColumns.map(escapeIdentifier).join(', ')})
        SELECT ${selection.join(', ')} FROM batch ORDER BY id
        ON CONFLICT (id) DO UPDATE SET ${targetColumns
          .filter((column) => !['id', 'workspaceId'].includes(column))
          .map(
            (column) =>
              `${escapeIdentifier(column)} = EXCLUDED.${escapeIdentifier(column)}`,
          )
          .join(', ')}
        ${target === 'core' ? 'WHERE destination."workspaceId" = $1' : ''}
        RETURNING id
      ) SELECT batch.id, copied.id IS NOT NULL AS copied FROM batch LEFT JOIN copied USING (id) ORDER BY batch.id`,
      [workspaceId, lastId, batchSize],
    );
    const rejected = rows.find((row) => !row.copied);
    if (isDefined(rejected)) {
      throw new Error(
        `Could not copy ${table.name} ${rejected.id}: destination ID belongs to another workspace`,
      );
    }
    return rows.map((row) => row.id);
  }
}
