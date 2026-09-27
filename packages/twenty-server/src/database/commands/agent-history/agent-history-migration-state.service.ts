import { Injectable } from '@nestjs/common';
import { type QueryRunner } from 'typeorm';

import { AgentHistoryMigrationStateException } from 'src/database/commands/agent-history/agent-history-migration-state.exception';
import {
  agentHistoryMigrationStateSchema,
  type AgentHistoryMigrationState,
} from 'src/database/commands/agent-history/agent-history-migration-state.type';
import { AGENT_HISTORY_MIGRATION_STORAGE_KEY } from 'src/database/commands/agent-history/agent-history-migration-storage-key.constant';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

// Upgrades from 2.42 must retain their route protocol when runtime storage changes.
@Injectable()
export class AgentHistoryMigrationStateService {
  async readState(
    runner: QueryRunner,
    workspaceId: string,
  ): Promise<AgentHistoryMigrationState> {
    return (await this.readStates(runner, [workspaceId])).get(workspaceId)!;
  }

  private async readStates(
    runner: QueryRunner,
    workspaceIds: string[],
  ): Promise<Map<string, AgentHistoryMigrationState>> {
    const rows: { workspaceId: string; type: string; value: unknown }[] =
      await runner.query(
        `SELECT "workspaceId", type, value FROM core."keyValuePair" WHERE "key" = $1 AND "workspaceId" = ANY($2::uuid[]) AND "userId" IS NULL AND "applicationId" IS NULL`,
        [AGENT_HISTORY_MIGRATION_STORAGE_KEY, workspaceIds],
      );
    const states = new Map<string, AgentHistoryMigrationState>();
    for (const row of rows) {
      const parsed = agentHistoryMigrationStateSchema.safeParse(row.value);
      if (row.type !== 'CONFIG_VARIABLE' || !parsed.success) {
        throw new AgentHistoryMigrationStateException(
          'INVALID_STATE',
          `Invalid agent history storage state for ${row.workspaceId}`,
        );
      }
      states.set(row.workspaceId, parsed.data);
    }
    const missing = workspaceIds.filter((id) => !states.has(id));
    if (missing.length) {
      const prepared: { workspaceId: string; tableName: string }[] =
        await runner.query(
          `SELECT id AS "workspaceId", table_name AS "tableName" FROM unnest($1::uuid[], $2::text[]) AS candidate(id, table_name) WHERE to_regclass(table_name) IS NOT NULL`,
          [
            missing,
            missing.map(
              (id) =>
                `${escapeIdentifier(getWorkspaceSchemaName(id))}."agentChatThread"`,
            ),
          ],
        );
      // A lost route must never silently expose an empty legacy snapshot after cleanup.
      // Empty, never-routed stores remain indistinguishable during the expand release.
      for (let offset = 0; offset < prepared.length; offset += 50) {
        const batch = prepared.slice(offset, offset + 50);
        const populated: { workspaceId: string }[] = await runner.query(
          batch
            .map(
              ({ tableName }, index) =>
                `SELECT $${index + 1}::uuid AS "workspaceId" WHERE EXISTS (SELECT 1 FROM ${tableName})`,
            )
            .join(' UNION ALL '),
          batch.map(({ workspaceId }) => workspaceId),
        );
        if (populated.length) {
          throw new AgentHistoryMigrationStateException(
            'MISSING_STATE',
            `Agent history route is missing for ${populated[0].workspaceId}; restore its durable state before serving traffic`,
          );
        }
      }
      for (const workspaceId of missing)
        states.set(workspaceId, { storage: 'core' });
    }
    return states;
  }

  async writeState(
    runner: QueryRunner,
    workspaceId: string,
    state: AgentHistoryMigrationState,
  ): Promise<void> {
    const rows = await runner.query(
      `INSERT INTO core."keyValuePair" ("key", "workspaceId", "type", "value") VALUES ($1, $2, 'CONFIG_VARIABLE', $3::jsonb)
       ON CONFLICT ("key", "workspaceId") WHERE "userId" IS NULL AND "applicationId" IS NULL
       DO UPDATE SET "value" = EXCLUDED."value", "updatedAt" = now() WHERE "keyValuePair".type = 'CONFIG_VARIABLE' RETURNING "key"`,
      [AGENT_HISTORY_MIGRATION_STORAGE_KEY, workspaceId, JSON.stringify(state)],
    );
    if (!rows.length) {
      throw new AgentHistoryMigrationStateException(
        'INVALID_STATE',
        'Agent history route conflicts with a non-configuration key',
      );
    }
  }
}
