import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { executeDeployedFunctionOrThrow } from './execute-deployed-function-or-throw';
import { readManifestLogicFunctionNamesOrThrow } from './read-manifest-logic-function-names-or-throw';
import { describe, expect, it } from 'vitest';

// These scenarios run the functions the way the server runs them: deployed,
// in the app runtime, against the real connection store and job queue. No
// Fathom account is connected on the test workspace, so every path ends at
// the connection lookup, after the bundle, the SDK calls and the input
// validation have run for real.
const buildRoutePayload = (body: Record<string, unknown>) => ({
  headers: {},
  queryStringParameters: {},
  pathParameters: {},
  body,
  isBase64Encoded: false,
  requestContext: { http: { method: 'POST', path: '/fathom/backfill' } },
});

describe('Fathom app deployed functions', () => {
  it('deploys every logic function the manifest declares', async () => {
    const deployedFunctionsResult = await new MetadataApiClient().query({
      findManyLogicFunctions: { id: true, name: true },
    });
    const deployedFunctionNames: string[] =
      deployedFunctionsResult.findManyLogicFunctions.map(
        (logicFunction: { name: string }) => logicFunction.name,
      );

    for (const manifestFunctionName of await readManifestLogicFunctionNamesOrThrow()) {
      expect(deployedFunctionNames).toContain(manifestFunctionName);
    }
  });

  it('rejects a backfill window outside the allowed range before touching the queue', async () => {
    const execution = await executeDeployedFunctionOrThrow({
      functionName: 'fathom-backfill',
      payload: buildRoutePayload({ days: 0 }),
    });

    expect(execution.status).toBe('SUCCESS');
    expect(execution.data).toEqual({
      success: false,
      error: expect.stringContaining('between 1 and'),
    });
  });

  it('reports the missing Fathom connection from the deployed backfill route', async () => {
    const execution = await executeDeployedFunctionOrThrow({
      functionName: 'fathom-backfill',
      payload: buildRoutePayload({ days: 30 }),
    });

    expect(execution.status).toBe('SUCCESS');
    expect(execution.data).toEqual({
      success: false,
      error: expect.stringContaining('Fathom is not connected'),
    });
  });

  it('rejects invalid workflow action input before looking up a connection', async () => {
    const listExecution = await executeDeployedFunctionOrThrow({
      functionName: 'fathom-list-calls-by-participant',
      payload: { participantEmail: '   ' },
    });
    const syncExecution = await executeDeployedFunctionOrThrow({
      functionName: 'fathom-sync-call',
      payload: {
        recordingId: '42',
      },
    });

    expect(listExecution.status).toBe('SUCCESS');
    expect(listExecution.data).toEqual({
      success: false,
      error: 'participantEmail is required',
    });
    expect(syncExecution.status).toBe('SUCCESS');
    expect(syncExecution.data).toEqual({
      success: false,
      error: 'recordingId must be an integer',
    });
  });

  it('reports the missing Fathom connection from the deployed workflow actions', async () => {
    const listExecution = await executeDeployedFunctionOrThrow({
      functionName: 'fathom-list-calls-by-participant',
      payload: { participantEmail: 'ada@example.com' },
    });
    const syncExecution = await executeDeployedFunctionOrThrow({
      functionName: 'fathom-sync-call',
      payload: {
        recordingId: 42,
      },
    });

    expect(listExecution.status).toBe('SUCCESS');
    expect(listExecution.data).toEqual({
      success: false,
      error: expect.stringContaining('Fathom is not connected'),
    });
    expect(syncExecution.status).toBe('SUCCESS');
    expect(syncExecution.data).toEqual({
      success: false,
      error: expect.stringContaining('Fathom is not connected'),
    });
  });
});
