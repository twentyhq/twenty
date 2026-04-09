import { parseAndValidateGroupByFieldsOrThrow } from 'src/engine/api/common/common-args-processors/group-by-arg-processor/utils/parse-and-validate-group-by-fields-or-throw.util';
import { type GroupByField } from 'src/engine/api/common/common-query-runners/types/group-by-field.types';
import { type GroupByResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const parseGroupByArgs = (
  args: GroupByResolverArgs,
  flatObjectMetadata: FlatObjectMetadata,
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>,
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
): GroupByField[] => {
  return parseAndValidateGroupByFieldsOrThrow({
    groupBy: args.groupBy,
    flatObjectMetadata,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  });
};
