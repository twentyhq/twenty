import { type RequestHandler } from 'msw';
import { type AppConnection } from 'twenty-sdk/logic-function';

export type AppRuntimeMock = {
  handlers: RequestHandler[];
  readonly connectionRequestCount: number;
  setConnections: (connections: AppConnection[]) => void;
  reset: () => void;
};
