import { type ApplicationState } from '~/generated-metadata/graphql';

// The columns the application broadcast payload carries: relations and derived
// fields (logoUrl, roles, objects, …) stay with the queries that resolve them.
export type FlatApplication = {
  id: string;
  universalIdentifier: string;
  name: string;
  state: ApplicationState;
  version: string | null;
};
