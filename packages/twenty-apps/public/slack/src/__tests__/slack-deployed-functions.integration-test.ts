import * as fs from 'fs';
import * as path from 'path';

import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { functionExecute } from 'twenty-sdk/cli';
import { beforeAll, describe, expect, it } from 'vitest';

import { buildSlackAppMentionEventBody } from 'src/__tests__/utils/build-slack-app-mention-event-body.util';
import { buildSlackRoutePayload } from 'src/__tests__/utils/build-slack-route-payload.util';
import { requireDefinedOrThrow } from 'src/__tests__/utils/require-defined-or-throw.util';
import { SLACK_TEST_WEBHOOK_SECRET } from 'src/__tests__/constants/slack-test-webhook-secret.constant';
import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

// These scenarios run the functions the way the server runs them - deployed,
// in the app runtime, with the app's own access token and server variables -
// which nothing running in the test process can prove on its own.
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

  let webhookSecretVariableId: string | undefined;

  const writeWebhookSecret = async (value: string): Promise<void> => {
    await metadataClient.mutation({
      updateApplicationRegistrationVariable: {
        __args: {
          input: {
            id: requireDefinedOrThrow(
              webhookSecretVariableId,
              'The SLACK_WEBHOOK_SECRET variable id was not found on the test workspace',
            ),
            update: { value },
          },
        },
        id: true,
      },
    });
  };

  // Narrows the window in which the instance verifies Slack signatures against
  // a value published in this repository to the block that needs it.
  const withTestWebhookSecret = async (
    run: () => Promise<void>,
  ): Promise<void> => {
    await writeWebhookSecret(SLACK_TEST_WEBHOOK_SECRET);

    try {
      await run();
    } finally {
      await writeWebhookSecret('');
    }
  };

  const verifiesTestWebhookSecret = async (): Promise<boolean> => {
    const execution = await executeDeployedFunction('slack-events-resolver', {
      ...buildSlackRoutePayload({
        type: 'url_verification',
        challenge: 'leftover-secret-probe',
      }),
    });

    return execution.status === 'SUCCESS';
  };

  beforeAll(async () => {
    const applicationsResult = await metadataClient.query({
      findManyApplications: {
        id: true,
        universalIdentifier: true,
        applicationRegistrationId: true,
      },
    });

    const slackApplication = requireDefinedOrThrow(
      applicationsResult.findManyApplications.find(
        (application: { universalIdentifier: string }) =>
          application.universalIdentifier === APPLICATION_UNIVERSAL_IDENTIFIER,
      ),
      'The Slack application was not found on the test workspace',
    );

    const variablesResult = await metadataClient.query({
      findApplicationRegistrationVariables: {
        __args: {
          applicationRegistrationId: requireDefinedOrThrow(
            slackApplication.applicationRegistrationId,
            'The Slack application registration was not found on the test workspace',
          ),
        },
        id: true,
        key: true,
        isFilled: true,
      },
    });

    const webhookSecretVariable = requireDefinedOrThrow(
      variablesResult.findApplicationRegistrationVariables.find(
        (variable: { key: string }) => variable.key === 'SLACK_WEBHOOK_SECRET',
      ),
      'The SLACK_WEBHOOK_SECRET application variable was not found on the test workspace',
    );

    webhookSecretVariableId = webhookSecretVariable.id;

    // The stored secret is write-only, so a real one could not be put back
    // afterwards: refuse to overwrite it rather than leaving the instance
    // verifying Slack signatures against a public test value. A secret this
    // suite left behind when it was interrupted is the one exception, and it
    // is recognisable because it verifies the public test signature.
    if (webhookSecretVariable.isFilled) {
      if (!(await verifiesTestWebhookSecret())) {
        throw new Error(
          'SLACK_WEBHOOK_SECRET is already set on this instance. Run the integration suite against a disposable Twenty instance.',
        );
      }

      await writeWebhookSecret('');
    }
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
    await withTestWebhookSecret(async () => {
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
  });

  it('should reject an unsigned Slack request from the deployed events route', async () => {
    await withTestWebhookSecret(async () => {
      const execution = await executeDeployedFunction('slack-events-resolver', {
        ...buildSlackRoutePayload(
          { type: 'url_verification', challenge: 'deployed-challenge-token' },
          { secret: 'not-the-signing-secret' },
        ),
      });

      expect(execution.status).toBe('ERROR');
      expect(execution.error?.errorMessage).toContain(
        'Invalid Slack signature',
      );
    });
  });

  // The team claim lives in a SERVER scoped key value entry, which only the app
  // access token can read. Reaching the refusal proves the real runtime answers
  // the scoped read the way the in-process app runtime fake pretends it does.
  it('should refuse an event from an unclaimed Slack team through the real key value store', async () => {
    await withTestWebhookSecret(async () => {
      const execution = await executeDeployedFunction('slack-events-resolver', {
        ...buildSlackRoutePayload(
          buildSlackAppMentionEventBody({
            channelId: 'C0DEPLOYED',
            text: 'hello',
            teamId: 'T0UNCLAIMED',
          }),
        ),
      });

      expect(execution.status).toBe('ERROR');
      expect(execution.error?.errorMessage).toContain(
        'No workspace has claimed Slack team T0UNCLAIMED',
      );
    });
  });

  it('should report the missing Slack connection from the deployed channel list tool', async () => {
    const execution = await executeDeployedFunction('slack-list-channels', {});

    expect(execution.status).toBe('SUCCESS');
    expect(execution.data).toEqual({
      success: false,
      channels: [],
      count: 0,
      error: expect.stringContaining('Slack is not connected'),
    });
  });
});
