import { isDefined } from 'twenty-shared/utils';
import { MetadataWritability } from '~/generated-metadata/graphql';

// Only OPEN accepts user-session writes: APPLICATION is reserved to the owning app, SYSTEM to the platform.
// Missing writability predates the flag and means OPEN.
export const isMetadataWritabilityRestricted = (
  writability: MetadataWritability | null | undefined,
): boolean =>
  isDefined(writability) && writability !== MetadataWritability.OPEN;
