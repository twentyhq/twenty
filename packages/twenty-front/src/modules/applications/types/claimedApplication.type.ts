import { type ApplicationState } from '~/generated-metadata/graphql';

export type ClaimedApplication = {
  id: string;
  universalIdentifier: string;
  version?: string | null;
  state: ApplicationState;
};
