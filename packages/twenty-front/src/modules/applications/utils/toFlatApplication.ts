import { type FlatApplication } from '@/metadata-store/types/FlatApplication';
import { type ApplicationState } from '~/generated-metadata/graphql';

type ApplicationQueryResult = {
  id: string;
  universalIdentifier: string;
  name: string;
  state: ApplicationState;
  version?: string | null;
};

// The metadata store is fed by both this projection and the broadcast payload,
// which carries exactly these columns: the two shapes have to match or an event
// would replace a seeded application with a different object.
export const toFlatApplication = (
  application: ApplicationQueryResult,
): FlatApplication => ({
  id: application.id,
  universalIdentifier: application.universalIdentifier,
  name: application.name,
  state: application.state,
  version: application.version ?? null,
});
