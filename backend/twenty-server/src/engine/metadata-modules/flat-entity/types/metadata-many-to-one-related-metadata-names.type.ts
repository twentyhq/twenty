import { type AllMetadataName } from 'twenty-shared/metadata';

import { type ALL_MANY_TO_ONE_METADATA_RELATIONS } from 'src/engine/metadata-modules/flat-entity/constant/all-many-to-one-metadata-relations.constant';

type ExtractMetadataNames<T> = {
  [K in keyof T]: T[K] extends { metadataName: infer M } ? M : never;
}[keyof T];

export type MetadataManyToOneRelatedMetadataNames<T extends AllMetadataName> =
  Extract<
    ExtractMetadataNames<(typeof ALL_MANY_TO_ONE_METADATA_RELATIONS)[T]>,
    AllMetadataName
  >;
