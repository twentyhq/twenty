import { defineLogicFunction, type RoutePayload } from 'twenty-sdk';
import { CoreApiClient } from 'twenty-sdk/generated';

type TelemetryEventPayload = {
  action: string;
  timestamp: string;
  version: string;
  payload: {
    userId: string | null;
    workspaceId: string | null;
    payload?: {
      events?: Array<{
        userId?: string;
        userEmail?: string;
        userFirstName?: string;
        userLastName?: string;
        locale?: string;
        serverUrl?: string;
      }>;
    };
  };
};

export const main = async (
  params: RoutePayload<TelemetryEventPayload>,
): Promise<{ success: boolean; message: string; error?: string }> => {
  try {
    const { action, payload } = params.body || {};

    if (action !== 'user_signup') {
      return {
        success: true,
        message: `Event type '${action}' ignored`,
      };
    }

    const userEmail =
      payload?.payload?.events?.[0]?.userEmail ||
      payload?.payload?.events?.[0]?.userId;

    if (!userEmail) {
      return {
        success: false,
        message: 'No email found in telemetry event',
        error: 'Missing userEmail in payload',
      };
    }

    if (
      userEmail.toLowerCase().includes('example') ||
      userEmail.toLowerCase().includes('test')
    ) {
      return {
        success: true,
        message: `Email '${userEmail}' ignored (contains test/example data)`,
      };
    }

    const client = new CoreApiClient();

    // Create or update selfHostingUser record
    const result = await client.mutation({
      createSelfHostingUser: {
        __args: {
          data: {
            name:
              payload?.payload?.events?.[0]?.userFirstName +
              ' ' +
              payload?.payload?.events?.[0]?.userLastName,
            email: {
              primaryEmail: userEmail,
              additionalEmails: null,
            },
          },
          upsert: true,
        },
        id: true,
        email: {
          primaryEmail: true,
        },
      },
    });

    return {
      success: true,
      message: `Self hosting user created/updated: ${result.createSelfHostingUser?.id}`,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to process telemetry event',
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

export default defineLogicFunction({
  universalIdentifier: '10104201-622b-4a5e-9f27-8f2af19b2a3c',
  name: 'telemetry-webhook',
  timeoutSeconds: 5,
  handler: main,
  httpRouteTriggerSettings: {
    path: '/webhook/telemetry',
    httpMethod: 'POST',
    isAuthRequired: false,
  },
});
