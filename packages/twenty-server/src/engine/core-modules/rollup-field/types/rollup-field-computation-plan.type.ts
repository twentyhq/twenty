import { type FieldMetadataType } from 'twenty-shared/types';

import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export type RollupFieldComputationPlan = {
  rollupFlatFieldMetadata: OrmFlatFieldMetadata<FieldMetadataType.ROLLUP>;
  childFlatObjectMetadata: FlatObjectMetadata;
  childJoinColumnName: string;
  aggregatedColumnName: string | null;
};
