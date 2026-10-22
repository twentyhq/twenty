import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { executeDeployedFunctionOrThrow } from './execute-deployed-function-or-throw';
import { readManifestLogicFunctionNamesOrThrow } from './read-manifest-logic-function-names-or-throw';
import { describe, expect, it } from 'vitest';

import { GRANOLA_BACKFILL_ROUTE_PATH } from 'src/constants/granola-backfill-route-path';

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
    const result = await new MetadataApiClient().query({
      findManyLogicFunctions: { name: true },
    });
    const deployedNames = result.findManyLogicFunctions.map(
      (logicFunction) => logicFunction.name,
    );
    for (const name of await readManifestLogicFunctionNamesOrThrow()) {
      expect(deployedNames).toContain(name);
    }
  });

  it('reports the missing API key from the deployed connection status route', async () => {
    const execution = await executeDeployedFunctionOrThrow({
      functionName: 'granola-connection-status',
      payload: {},
    });
    expect(execution.status).toBe('SUCCESS');
    expect(execution.data).toEqual({ isConnected: false, isApiKeySet: false });
  });

  it.each([0, -1, 3651, 1.5, '31'])(
    'rejects the invalid backfill window %s before enqueueing',
    async (days) => {
      const execution = await executeDeployedFunctionOrThrow({
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
      const execution = await executeDeployedFunctionOrThrow({
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
      const execution = await executeDeployedFunctionOrThrow({
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
