import { type ServerlessFunctionConfig } from 'twenty-sdk/application';
import { createClient } from '../generated';

type ServerlessFunctionEvent<TBody = object> = {
  /** HTTP headers (filtered by forwardedRequestHeaders in route trigger) */
  headers: Record<string, string | undefined>;

  /** Query string parameters (multiple values are joined with commas, e.g., "1,2,3") */
  queryStringParameters: Record<string, string | undefined>;

  /** Path parameters extracted from the route pattern (e.g., /users/:id → { id: '123' }). Multiple values are joined with commas. */
  pathParameters: Record<string, string | undefined>;

  /** Request body */
  body: TBody | null;

  /** Whether the body is base64 encoded */
  isBase64Encoded: boolean;

  /** Request context containing HTTP method, path, and other metadata */
  requestContext: {
    http: {
      /** HTTP method (GET, POST, PUT, PATCH, DELETE) */
      method: string;
      /** Raw request path (e.g., /users/123) */
      path: string;
    };
  };
};

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
  params: ServerlessFunctionEvent<TelemetryEventPayload>,
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

    const client = createClient({
      url: `${process.env.TWENTY_API_URL}/graphql`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.TWENTY_API_KEY}`,
      },
    });

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

export const config: ServerlessFunctionConfig = {
  universalIdentifier: '10104201-622b-4a5e-9f27-8f2af19b2a3c',
  name: 'telemetry-webhook',
  timeoutSeconds: 5,
  triggers: [
    {
      universalIdentifier: '7c8e3f5a-9b4c-4d1e-8f2a-1b3c4d5e6f7a',
      type: 'route',
      path: '/webhook/telemetry',
      httpMethod: 'POST',
      isAuthRequired: false,
    },
  ],
};
