import { type AppConnection } from 'twenty-sdk/logic-function';

export type AppRuntimeMockOptions = {
  apiUrl: string;
  workspaceId: string;
  connections?: AppConnection[];
};
