import { http, HttpResponse, passthrough, type RequestHandler } from 'msw';
import {
  type AppConnection,
  type RunAgentInput,
  type RunAgentResult,
} from 'twenty-sdk/logic-function';

// The app runtime services (`kv`, `listConnections`, `getConnection`,
// `runAgent`) are GraphQL calls the server only answers for an
// application-scoped token, which a test workspace API key is not. They are
// answered here instead, with the same semantics the server implements, while
// every other request to /metadata and /graphql reaches the real server.
export type AppKeyValueScope = 'WORKSPACE' | 'SERVER';

type StoredKeyValueEntry = {
  value: unknown;
  workspaceId: string | null;
};

export type AppRuntimeMockOptions = {
  apiUrl: string;
  workspaceId: string;
  connections?: AppConnection[];
};

export type AppRuntimeMock = {
  handlers: RequestHandler[];
  workspaceId: string;
  setConnections: (connections: AppConnection[]) => void;
  setAgentResult: (
    implementation: RunAgentResult | ((input: RunAgentInput) => RunAgentResult),
  ) => void;
  readonly agentRuns: RunAgentInput[];
  readonly lastAgentPrompt: string | undefined;
  getKeyValue: (key: string, scope: AppKeyValueScope) => unknown;
  setKeyValue: (key: string, value: unknown, scope?: AppKeyValueScope) => void;
  reset: () => void;
};

const buildKeyValueStoreKey = (key: string, scope: AppKeyValueScope): string =>
  scope === 'SERVER' ? `SERVER:${key}` : `WORKSPACE:${key}`;

const readOperationName = (query: string): string | undefined =>
  query.match(/(?:query|mutation)\s+(\w+)/)?.[1];

const graphqlError = (message: string) =>
  HttpResponse.json({ errors: [{ message }] });

export const createAppRuntimeMock = ({
  apiUrl,
  workspaceId,
  connections = [],
}: AppRuntimeMockOptions): AppRuntimeMock => {
  let appConnections = connections;
  let keyValueStore = new Map<string, StoredKeyValueEntry>();
  let agentRuns: RunAgentInput[] = [];
  let runAgentImplementation: (
    input: RunAgentInput,
  ) => RunAgentResult = () => ({
    success: true,
    result: { response: 'Agent answer.' },
    error: null,
  });

  const getKeyValue = (key: string, scope: AppKeyValueScope): unknown => {
    const entry = keyValueStore.get(buildKeyValueStoreKey(key, scope));

    if (entry === undefined) {
      return null;
    }

    return entry.value;
  };

  // SERVER keys are a cross-workspace claim registry: the stored value is
  // always the claiming workspace id, and only that workspace can overwrite
  // or delete the key.
  const claimServerKey = (key: string) => {
    const storeKey = buildKeyValueStoreKey(key, 'SERVER');
    const existingEntry = keyValueStore.get(storeKey);

    if (existingEntry === undefined) {
      keyValueStore.set(storeKey, { value: workspaceId, workspaceId: null });

      return { key, value: workspaceId, scope: 'SERVER' };
    }

    if (existingEntry.value !== workspaceId) {
      return null;
    }

    return { key, value: existingEntry.value, scope: 'SERVER' };
  };

  const setKeyValue = (
    key: string,
    value: unknown,
    scope: AppKeyValueScope,
  ) => {
    if (scope === 'SERVER') {
      return claimServerKey(key);
    }

    keyValueStore.set(buildKeyValueStoreKey(key, 'WORKSPACE'), {
      value,
      workspaceId,
    });

    return { key, value, scope };
  };

  const deleteKeyValue = (key: string, scope: AppKeyValueScope): boolean => {
    const storeKey = buildKeyValueStoreKey(key, scope);
    const entry = keyValueStore.get(storeKey);

    if (entry === undefined) {
      return false;
    }

    if (scope === 'SERVER' && entry.value !== workspaceId) {
      return false;
    }

    keyValueStore.delete(storeKey);

    return true;
  };

  const handleOperation = (
    operationName: string,
    variables: Record<string, unknown>,
  ) => {
    switch (operationName) {
      case 'ListAppConnections': {
        const filter = (variables.filter ?? {}) as { providerName?: string };

        return HttpResponse.json({
          data: {
            appConnections: appConnections.filter(
              (connection) =>
                filter.providerName === undefined ||
                connection.providerName === filter.providerName,
            ),
          },
        });
      }
      case 'GetAppConnection': {
        const connection = appConnections.find(
          (candidate) => candidate.id === variables.id,
        );

        if (connection === undefined) {
          return graphqlError(`App connection ${variables.id} not found`);
        }

        return HttpResponse.json({ data: { appConnection: connection } });
      }
      case 'GetAppKeyValue': {
        const key = String(variables.key);
        const scope = (variables.scope ?? 'WORKSPACE') as AppKeyValueScope;
        const storedValue = getKeyValue(key, scope);

        return HttpResponse.json({
          data: {
            appKeyValue:
              storedValue === null ? null : { key, value: storedValue, scope },
          },
        });
      }
      case 'SetAppKeyValue': {
        const input = variables.input as {
          key: string;
          value: unknown;
          scope?: AppKeyValueScope;
        };
        const result = setKeyValue(
          input.key,
          input.value,
          input.scope ?? 'WORKSPACE',
        );

        if (result === null) {
          return graphqlError(
            `Server key "${input.key}" is already claimed by another workspace`,
          );
        }

        return HttpResponse.json({ data: { setAppKeyValue: result } });
      }
      case 'DeleteAppKeyValue':
        return HttpResponse.json({
          data: {
            deleteAppKeyValue: deleteKeyValue(
              String(variables.key),
              (variables.scope ?? 'WORKSPACE') as AppKeyValueScope,
            ),
          },
        });
      case 'RunAgent': {
        const input = variables.input as RunAgentInput;

        agentRuns.push(input);

        return HttpResponse.json({
          data: { runAgent: runAgentImplementation(input) },
        });
      }
      default:
        return passthrough();
    }
  };

  const handlers: RequestHandler[] = [
    http.post(`${apiUrl}/metadata`, async ({ request }) => {
      const body = (await request.clone().json()) as {
        query?: string;
        variables?: Record<string, unknown>;
      };
      const operationName = readOperationName(body.query ?? '');

      if (operationName === undefined) {
        return passthrough();
      }

      return handleOperation(operationName, body.variables ?? {});
    }),
  ];

  return {
    handlers,
    workspaceId,

    setConnections: (nextConnections: AppConnection[]): void => {
      appConnections = nextConnections;
    },

    setAgentResult: (
      implementation:
        | RunAgentResult
        | ((input: RunAgentInput) => RunAgentResult),
    ): void => {
      runAgentImplementation =
        typeof implementation === 'function'
          ? implementation
          : () => implementation;
    },

    get agentRuns(): RunAgentInput[] {
      return agentRuns;
    },

    get lastAgentPrompt(): string | undefined {
      const lastRun = agentRuns[agentRuns.length - 1];

      return lastRun !== undefined && 'prompt' in lastRun
        ? lastRun.prompt
        : undefined;
    },

    getKeyValue,

    setKeyValue: (
      key: string,
      value: unknown,
      scope: AppKeyValueScope = 'WORKSPACE',
    ): void => {
      keyValueStore.set(buildKeyValueStoreKey(key, scope), {
        value,
        workspaceId: scope === 'SERVER' ? null : workspaceId,
      });
    },

    reset: (): void => {
      appConnections = connections;
      keyValueStore = new Map();
      agentRuns = [];
      runAgentImplementation = () => ({
        success: true,
        result: { response: 'Agent answer.' },
        error: null,
      });
    },
  };
};
