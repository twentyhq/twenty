import * as fs from 'fs';
import * as path from 'path';

import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { functionExecute } from 'twenty-sdk/cli';
import { beforeAll, describe, expect, it } from 'vitest';

import { buildSlackRoutePayload } from 'src/__tests__/utils/build-slack-event-payloads';
import { SLACK_TEST_WEBHOOK_SECRET } from 'src/__tests__/utils/setup-slack-integration-test';
import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

// These scenarios run the functions the way the server runs them - deployed,
// in the app runtime, with the app's own access token and server variables -
// which nothing running in the test process can prove on its own.
const APP_PATH = process.cwd();

const requireDefined = <TValue>(
  value: TValue | undefined,
  what: string,
): TValue => {
  if (value === undefined) {
    throw new Error(`${what} was not found on the test workspace`);
  }

  return value;
};

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

const readManifestLogicFunctionNames = (): string[] => {
  const manifest = JSON.parse(
    fs.readFileSync(
      path.join(APP_PATH, '.twenty', 'output', 'manifest.json'),
      'utf8',
    ),
  ) as { logicFunctions: { name: string }[] };

  return manifest.logicFunctions.map((logicFunction) => logicFunction.name);
};

describe('Slack app deployed functions', () => {
  const metadataClient = new MetadataApiClient();

  beforeAll(async () => {
    const applicationsResult = await metadataClient.query({
      findManyApplications: {
        id: true,
        universalIdentifier: true,
        applicationRegistrationId: true,
      },
    });

    const slackApplication = requireDefined(
      applicationsResult.findManyApplications.find(
        (application: { universalIdentifier: string }) =>
          application.universalIdentifier === APPLICATION_UNIVERSAL_IDENTIFIER,
      ),
      'The Slack application',
    );

    const variablesResult = await metadataClient.query({
      findApplicationRegistrationVariables: {
        __args: {
          applicationRegistrationId: requireDefined(
            slackApplication.applicationRegistrationId,
            'The Slack application registration',
          ),
        },
        id: true,
        key: true,
      },
    });

    const webhookSecretVariable = requireDefined(
      variablesResult.findApplicationRegistrationVariables.find(
        (variable: { key: string }) => variable.key === 'SLACK_WEBHOOK_SECRET',
      ),
      'The SLACK_WEBHOOK_SECRET application variable',
    );

    await metadataClient.mutation({
      updateApplicationRegistrationVariable: {
        __args: {
          input: {
            id: webhookSecretVariable.id,
            update: { value: SLACK_TEST_WEBHOOK_SECRET },
          },
        },
        id: true,
      },
    });
  });

  it('should deploy every logic function the manifest declares', async () => {
    const deployedFunctionsResult = await metadataClient.query({
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

  it('should answer the Slack url_verification handshake from the deployed events route', async () => {
    const execution = await executeDeployedFunction('slack-events-resolver', {
      ...buildSlackRoutePayload({
        type: 'url_verification',
        challenge: 'deployed-challenge-token',
      }),
    });

    expect(execution.status).toBe('SUCCESS');
    expect(execution.data).toEqual(
      expect.objectContaining({
        body: { challenge: 'deployed-challenge-token' },
      }),
    );
  });

  it('should reject an unsigned Slack request from the deployed events route', async () => {
    const execution = await executeDeployedFunction('slack-events-resolver', {
      ...buildSlackRoutePayload(
        { type: 'url_verification', challenge: 'deployed-challenge-token' },
        { secret: 'not-the-signing-secret' },
      ),
    });

    expect(execution.status).toBe('ERROR');
    expect(execution.error?.errorMessage).toContain('Invalid Slack signature');
  });

  it('should report the missing Slack connection from the deployed channel list route', async () => {
    const execution = await executeDeployedFunction(
      'slack-list-channels-route',
      {},
    );

    expect(execution.status).toBe('SUCCESS');
    expect(execution.data).toEqual({
      success: false,
      channels: [],
      count: 0,
      error: expect.stringContaining('Slack is not connected'),
    });
  });
});
