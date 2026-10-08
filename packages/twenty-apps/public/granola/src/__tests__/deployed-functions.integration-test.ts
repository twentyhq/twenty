import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { functionExecute } from 'twenty-sdk/cli';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { GRANOLA_BACKFILL_ROUTE_PATH } from 'src/constants/granola-backfill-route-path';

const APP_PATH = process.cwd();
const MANIFEST_SCHEMA = z.object({
  logicFunctions: z.array(z.object({ name: z.string() })),
});

const executeDeployedFunction = async ({
  functionName,
  payload,
}: {
  functionName: string;
  payload: Record<string, unknown>;
}) => {
  const result = await functionExecute({
    appPath: APP_PATH,
    functionName,
    payload,
  });
  if (!result.success) {
    throw new Error(
      `Could not execute ${functionName}: ${result.error.message}`,
    );
  }
  return result.data;
};

const buildBackfillRoutePayload = (body: Record<string, unknown>) => ({
  headers: {},
  queryStringParameters: {},
  pathParameters: {},
  body,
  isBase64Encoded: false,
  requestContext: {
    http: { method: 'POST', path: GRANOLA_BACKFILL_ROUTE_PATH },
  },
});

describe('Granola deployed functions', () => {
  it('deploys every function declared by the built application', async () => {
    const manifest = MANIFEST_SCHEMA.parse(
      JSON.parse(
        readFileSync(
          join(APP_PATH, '.twenty', 'output', 'manifest.json'),
          'utf8',
        ),
      ),
    );
    const result = await new MetadataApiClient().query({
      findManyLogicFunctions: { name: true },
    });
    const deployedNames = result.findManyLogicFunctions.map(
      (logicFunction) => logicFunction.name,
    );
    for (const { name } of manifest.logicFunctions) {
      expect(deployedNames).toContain(name);
    }
  });

  it('reports the missing API key from the deployed connection status route', async () => {
    const execution = await executeDeployedFunction({
      functionName: 'granola-connection-status',
      payload: {},
    });
    expect(execution.status).toBe('SUCCESS');
    expect(execution.data).toEqual({ isConnected: false, isApiKeySet: false });
  });

  it.each([0, -1, 3651, 1.5, '31'])(
    'rejects the invalid backfill window %s before enqueueing',
    async (days) => {
      const execution = await executeDeployedFunction({
        functionName: 'granola-backfill',
        payload: buildBackfillRoutePayload({ days }),
      });
      expect(execution.status).toBe('SUCCESS');
      expect(execution.data).toEqual({
        success: false,
        error: expect.stringContaining('between 1 and 3650'),
      });
    },
  );

  it.each([
    {
      functionName: 'granola-sync-note',
      payload: { noteId: 'not_invalid' },
      error: 'A valid Granola note ID is required.',
    },
    {
      functionName: 'granola-list-notes',
      payload: { limit: 31 },
      error:
        'Use valid date filters, a Granola folder ID, and a limit between 1 and 30.',
    },
    {
      functionName: 'granola-list-notes',
      payload: { createdAfter: 'not-a-date' },
      error:
        'Use valid date filters, a Granola folder ID, and a limit between 1 and 30.',
    },
    {
      functionName: 'granola-list-folders',
      payload: { limit: 0 },
      error: 'Use a limit between 1 and 30 and a valid pagination cursor.',
    },
  ])(
    'validates inputs in deployed $functionName',
    async ({ functionName, payload, error }) => {
      const execution = await executeDeployedFunction({
        functionName,
        payload,
      });
      expect(execution.status).toBe('SUCCESS');
      expect(execution.data).toEqual({ success: false, error });
    },
  );

  it.each([
    {
      functionName: 'granola-sync-note',
      payload: { noteId: 'not_12345678901234' },
    },
    { functionName: 'granola-list-notes', payload: { limit: 1 } },
    { functionName: 'granola-list-folders', payload: { limit: 1 } },
  ])(
    'reports the missing key from deployed $functionName',
    async ({ functionName, payload }) => {
      const execution = await executeDeployedFunction({
        functionName,
        payload,
      });
      expect(execution.status).toBe('SUCCESS');
      expect(execution.data).toEqual({
        success: false,
        error: expect.stringContaining('Connect Granola'),
      });
    },
  );
});
