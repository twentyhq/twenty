import { isDefined } from 'twenty-shared/utils';
import { MetadataWritability } from '~/generated-metadata/graphql';

// Only OPEN metadata accepts writes from a user session: APPLICATION is
// reserved to the owning application and SYSTEM to the platform itself.
// Missing writability means the metadata predates the flag, which is OPEN.
export const isMetadataWritabilityRestricted = (
  writability: MetadataWritability | null | undefined,
): boolean =>
  isDefined(writability) && writability !== MetadataWritability.OPEN;
