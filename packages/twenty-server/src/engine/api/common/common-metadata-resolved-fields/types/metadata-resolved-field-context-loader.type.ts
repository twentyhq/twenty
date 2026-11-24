import { type MetadataResolvedFieldResolverInstance } from 'src/engine/api/common/common-metadata-resolved-fields/types/metadata-resolved-field-resolver-instance.type';

export type MetadataResolvedFieldContextLoader = (
  metadataResolvedFieldResolver: MetadataResolvedFieldResolverInstance,
) => Promise<unknown>;
