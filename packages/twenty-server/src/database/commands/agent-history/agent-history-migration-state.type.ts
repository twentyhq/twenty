import { z } from 'zod';
import { AGENT_HISTORY_TABLES } from 'src/database/commands/agent-history/agent-history-tables.constant';

export const agentHistoryMigrationStateSchema = z
  .object({
    storage: z.enum(['core', 'workspace']),
    migration: z
      .object({
        phase: z.enum(['clearing', 'copying', 'aborting']),
        target: z.enum(['core', 'workspace']),
        tableIndex: z.number().int().min(0).max(AGENT_HISTORY_TABLES.length),
        lastId: z.string().uuid().nullable(),
      })
      .optional(),
    verifiedAt: z.string().datetime().optional(),
    cleanedAt: z.string().datetime().optional(),
  })
  .refine(
    (state) => !state.migration || state.migration.target !== state.storage,
  );

export type AgentHistoryMigrationState = z.infer<
  typeof agentHistoryMigrationStateSchema
>;
