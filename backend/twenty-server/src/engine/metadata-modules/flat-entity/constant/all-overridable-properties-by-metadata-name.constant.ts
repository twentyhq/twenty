import {
  ALL_METADATA_NAME,
  type AllMetadataName,
} from 'twenty-shared/metadata';

import {
  ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME,
  type MetadataEntityOverridablePropertyName,
} from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';

const computeOverridableProperties = <T extends AllMetadataName>(
  metadataName: T,
): MetadataEntityOverridablePropertyName<T>[] => {
  const config =
    ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME[metadataName];

  return (Object.entries(config) as [string, { isOverridable?: boolean }][])
    .filter(([_, conf]) => conf.isOverridable === true)
    .map(([property]) => property as MetadataEntityOverridablePropertyName<T>);
};

export const ALL_OVERRIDABLE_PROPERTIES_BY_METADATA_NAME = Object.values(
  ALL_METADATA_NAME,
).reduce(
  (acc, metadataName) => ({
    ...acc,
    [metadataName]: computeOverridableProperties(metadataName),
  }),
  {} as {
    [P in AllMetadataName]: MetadataEntityOverridablePropertyName<P>[];
  },
);
