import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';

export const isOneToManyRelationFlatField = (
  flatField: Pick<OrmFlatFieldMetadata, 'type' | 'settings'>,
): boolean =>
  (isFlatFieldMetadataOfType(flatField, FieldMetadataType.RELATION) ||
    isFlatFieldMetadataOfType(flatField, FieldMetadataType.MORPH_RELATION)) &&
  flatField.settings?.relationType === RelationType.ONE_TO_MANY;
