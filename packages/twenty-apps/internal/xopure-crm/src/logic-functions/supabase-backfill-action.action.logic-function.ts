import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';
import { createSupabaseReaderFromAnyEnv } from 'src/supabase-sync/backfill/read-supabase-rest-source';

import { handleSupabaseBackfillAction } from './handlers/supabase-backfill-action-handler';

type Input = {
  sourceTable?: string;
  dryRun?: boolean;
};

type Output = {
  success: boolean;
  error?: { code: string };
  dryRun?: boolean;
  scanned?: number;
  mapped?: number;
  created?: number;
  updated?: number;
  skipped?: number;
  failed?: number;
  tableCount?: number;
  durationMs?: number;
  completedAt?: string;
};

const handler = async (input: Input): Promise<Output> => {
  const client = new CoreApiClient();
  const readSourceBatch = createSupabaseReaderFromAnyEnv(process.env);

  return handleSupabaseBackfillAction({
    input,
    client,
    readSourceBatch,
  });
};

export default defineLogicFunction({
  universalIdentifier: 'e7e340c2-c63e-4716-91e8-bf74ec6aaa04',
  name: 'supabase-backfill-action',
  description: 'Workflow action that executes SupabaseBackfillAction logic.',
  handler,
  workflowActionTriggerSettings: {
    label: 'Supabase Backfill Action',
    icon: 'IconBolt',
    inputSchema: [
      {
        type: 'object',
        properties: {
          sourceTable: {
            type: 'string',
          },
          dryRun: {
            type: 'boolean',
          },
        },
      },
    ],
    outputSchema: [
      {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          dryRun: { type: 'boolean' },
          scanned: { type: 'number' },
          mapped: { type: 'number' },
          created: { type: 'number' },
          updated: { type: 'number' },
          skipped: { type: 'number' },
          failed: { type: 'number' },
          tableCount: { type: 'number' },
          durationMs: { type: 'number' },
          completedAt: { type: 'string' },
        },
      },
    ],
  },
});
