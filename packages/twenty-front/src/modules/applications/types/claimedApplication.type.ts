import { type ApplicationState } from '~/generated-metadata/graphql';

// The row an async install/upgrade/uninstall mutation claimed, in its
// transitional state: the client follows it by id until it settles.
export type ClaimedApplication = {
  id: string;
  universalIdentifier: string;
  version?: string | null;
  state: ApplicationState;
};
