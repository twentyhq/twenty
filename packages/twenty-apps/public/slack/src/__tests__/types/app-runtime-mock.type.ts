import { type RequestHandler } from 'msw';
import {
  type AppConnection,
  type RunAgentInput,
  type RunAgentResult,
} from 'twenty-sdk/logic-function';

import { type AppKeyValueScope } from 'src/__tests__/types/app-key-value-scope.type';

export type AppRuntimeMock = {
  handlers: RequestHandler[];
  workspaceId: string;
  setConnections: (connections: AppConnection[]) => void;
  setAgentResult: (
    implementation: RunAgentResult | ((input: RunAgentInput) => RunAgentResult),
  ) => void;
  readonly agentRuns: RunAgentInput[];
  readonly lastAgentMessages: NonNullable<RunAgentInput['messages']>;
  getKeyValue: (key: string, scope: AppKeyValueScope) => unknown;
  seedKeyValue: (key: string, value: unknown, scope?: AppKeyValueScope) => void;
  reset: () => void;
};
