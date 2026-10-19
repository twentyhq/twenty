import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';

export type AgentToolContext = {
  workspaceId: string;
  callingApplication?: FlatApplication;
};
