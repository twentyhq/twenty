import { type RequestHandler } from 'msw';
import { type AppConnection } from 'twenty-sdk/logic-function';

export type AppRuntimeMock = {
  handlers: RequestHandler[];
  setConnections: (connections: AppConnection[]) => void;
  reset: () => void;
};
