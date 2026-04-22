import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { type TelemetryEvent } from 'src/logic-functions/types/telemetry-event.type';

export const main = async (
  params: RoutePayload<TelemetryEvent>,
): Promise<{
  success: boolean;
  message: string;
  error?: string;
}> => {
  try {
    const {
      action,
      workspaceId,
      userWorkspaceId,
      userId,
      userEmail,
      userFirstName,
      userLastName,
      locale,
      serverUrl,
      serverId,
    } = params.body || {};

    if (action !== 'user_signup') {
      return {
        success: true,
        message: `Event type '${action}' ignored`,
      };
    }

    if (!userEmail) {
      return {
        success: true,
        message: 'No email found in telemetry event',
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

    let existingSelfHostingUserId: string | undefined = undefined;
    try {
      const { selfHostingUser: existingSelfHostingUser } = await client.query({
        selfHostingUser: {
          __args: {
            filter: {
              email: { primaryEmail: { eq: userEmail } },
            },
          },
          id: true,
        },
      });

      existingSelfHostingUserId = existingSelfHostingUser?.id;
    } catch {
      //
    }

    if (existingSelfHostingUserId) {
      await client.mutation({
        updateSelfHostingUser: {
          __args: {
            id: existingSelfHostingUserId,
            data: {
              name: { firstName: userFirstName, lastName: userLastName },
              email: { primaryEmail: userEmail, additionalEmails: null },
              userWorkspaceId,
              userId,
              locale,
              serverUrl,
              serverId,
            },
          },
          id: true,
        },
      });

      return {
        success: true,
        message: `Self hosting user ${existingSelfHostingUserId} updated`,
      };
    }

    const { createSelfHostingUser } = await client.mutation({
      createSelfHostingUser: {
        __args: {
          data: {
            name: { firstName: userFirstName, lastName: userLastName },
            email: { primaryEmail: userEmail, additionalEmails: null },
            workspaceId,
            userWorkspaceId,
            userId,
            locale,
            serverUrl,
            serverId,
          },
        },
        id: true,
      },
    });

    return {
      success: true,
      message: `Self hosting user ${createSelfHostingUser?.id} created`,
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
  timeoutSeconds: 10,
  handler: main,
  httpRouteTriggerSettings: {
    path: '/webhook/telemetry',
    httpMethod: 'POST',
    isAuthRequired: false,
  },
});
