import { FieldMetadataType } from 'twenty-shared/types';

import { type CompositeProperty } from 'src/engine/metadata-modules/field-metadata/interfaces/composite-type.interface';

export function computeCompositeFieldTypeOptions(
  property: CompositeProperty<FieldMetadataType>,
) {
  return {
    nullable: !property.isRequired,
    isArray:
      property.type === FieldMetadataType.MULTI_SELECT || property.isArray,
  };
}
