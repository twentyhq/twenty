import { CompositeProperty } from 'src/engine/metadata-modules/field-metadata/interfaces/composite-type.interface';
import { FieldMetadataType } from 'twenty-shared/types';

export const computeCompositePropertyTarget = (
  type: FieldMetadataType,
  compositeProperty: CompositeProperty,
): string => {
  return `${type.toString()}->${compositeProperty.name}`;
};
