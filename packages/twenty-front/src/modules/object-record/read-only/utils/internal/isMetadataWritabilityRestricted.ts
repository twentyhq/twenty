import { isDefined } from 'twenty-shared/utils';
import { MetadataWritability } from '~/generated-metadata/graphql';

// Only OPEN accepts user-session writes; missing writability predates the flag and means OPEN.
export const isMetadataWritabilityRestricted = (
  writability: MetadataWritability | null | undefined,
): boolean =>
  isDefined(writability) && writability !== MetadataWritability.OPEN;
