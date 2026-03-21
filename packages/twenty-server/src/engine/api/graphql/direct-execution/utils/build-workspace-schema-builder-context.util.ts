import { type ResolverNameMapEntry } from 'src/engine/api/graphql/direct-execution/utils/build-resolver-name-map.util';
import { type WorkspaceSchemaBuilderContext } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/workspace-schema-builder-context.interface';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const buildWorkspaceSchemaBuilderContext = (
  entry: ResolverNameMapEntry,
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>,
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
  objectIdByNameSingular: Record<string, string>,
): WorkspaceSchemaBuilderContext => {
  const flatObjectMetadata =
    flatObjectMetadataMaps.byUniversalIdentifier[
      entry.objectMetadataUniversalIdentifier
    ];

  if (!flatObjectMetadata) {
    throw new Error(
      `Object metadata not found for universal identifier: ${entry.objectMetadataUniversalIdentifier}`,
    );
  }

  return {
    flatObjectMetadata,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    objectIdByNameSingular,
  };
};
