import {
  type FieldMetadataType,
  type CompositeProperty,
} from 'twenty-shared/types';

export const computeCompositePropertyTarget = (
  type: FieldMetadataType,
  compositeProperty: CompositeProperty,
): string => {
  return `${type.toString()}->${compositeProperty.name}`;
};
