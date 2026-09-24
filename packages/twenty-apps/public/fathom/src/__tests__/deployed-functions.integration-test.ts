import * as fs from 'fs';
import * as path from 'path';

import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { functionExecute } from 'twenty-sdk/cli';
import { describe, expect, it } from 'vitest';

// These scenarios run the functions the way the server runs them: deployed,
// in the app runtime, against the real connection store and job queue. No
// Fathom account is connected on the test workspace, so every path ends at
// the connection lookup, after the bundle, the SDK calls and the input
// validation have run for real.
const APP_PATH = process.cwd();

const executeDeployedFunction = async (
  functionName: string,
  payload: Record<string, unknown>,
) => {
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

const buildRoutePayload = (body: Record<string, unknown>) => ({
  headers: {},
  queryStringParameters: {},
  pathParameters: {},
  body,
  isBase64Encoded: false,
  requestContext: { http: { method: 'POST', path: '/fathom/backfill' } },
});

const readManifestLogicFunctionNames = (): string[] => {
  const manifest = JSON.parse(
    fs.readFileSync(
      path.join(APP_PATH, '.twenty', 'output', 'manifest.json'),
      'utf8',
    ),
  ) as { logicFunctions: { name: string }[] };

  return manifest.logicFunctions.map((logicFunction) => logicFunction.name);
};

describe('Fathom app deployed functions', () => {
  it('deploys every logic function the manifest declares', async () => {
    const deployedFunctionsResult = await new MetadataApiClient().query({
      findManyLogicFunctions: { id: true, name: true },
    });
    const deployedFunctionNames: string[] =
      deployedFunctionsResult.findManyLogicFunctions.map(
        (logicFunction: { name: string }) => logicFunction.name,
      );

    for (const manifestFunctionName of readManifestLogicFunctionNames()) {
      expect(deployedFunctionNames).toContain(manifestFunctionName);
    }
  });

  it('rejects a backfill window outside the allowed range before touching the queue', async () => {
    const execution = await executeDeployedFunction(
      'fathom-backfill',
      buildRoutePayload({ days: 0 }),
    );

    expect(execution.status).toBe('SUCCESS');
    expect(execution.data).toEqual({
      success: false,
      error: expect.stringContaining('between 1 and'),
    });
  });

  it('reports the missing Fathom connection from the deployed backfill route', async () => {
    const execution = await executeDeployedFunction(
      'fathom-backfill',
      buildRoutePayload({ days: 30 }),
    );

    expect(execution.status).toBe('SUCCESS');
    expect(execution.data).toEqual({
      success: false,
      error: expect.stringContaining('Fathom is not connected'),
    });
  });

  it('rejects invalid workflow action input before looking up a connection', async () => {
    const listExecution = await executeDeployedFunction(
      'fathom-list-calls-by-participant',
      { participantEmail: '   ' },
    );
    const syncExecution = await executeDeployedFunction('fathom-sync-call', {
      recordingId: '42',
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
    const listExecution = await executeDeployedFunction(
      'fathom-list-calls-by-participant',
      { participantEmail: 'ada@example.com' },
    );
    const syncExecution = await executeDeployedFunction('fathom-sync-call', {
      recordingId: 42,
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
