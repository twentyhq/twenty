import { FieldMetadataType } from 'twenty-shared';

import { CompositeProperty } from 'src/engine/metadata-modules/field-metadata/interfaces/composite-type.interface';

export const computeCompositePropertyTarget = (
  type: FieldMetadataType,
  compositeProperty: CompositeProperty,
): string => {
  return `${type.toString()}->${compositeProperty.name}`;
};
