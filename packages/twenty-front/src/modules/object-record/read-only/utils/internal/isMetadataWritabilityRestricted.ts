import { MetadataWritability } from '~/generated-metadata/graphql';

export const isMetadataWritabilityRestricted = (
  writability: MetadataWritability | null | undefined,
): boolean => writability === MetadataWritability.SYSTEM;
