import { type ApplicationState } from '~/generated-metadata/graphql';

export type RequestedApplication = {
  id: string;
  universalIdentifier: string;
  version?: string | null;
  state: ApplicationState;
};
