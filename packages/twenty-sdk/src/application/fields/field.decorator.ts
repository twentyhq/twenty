import { type FieldMetadataType } from 'twenty-shared/types';
import { type FieldManifest } from 'twenty-shared/application';

export const Field = <T extends FieldMetadataType>(
  _: FieldManifest<T>,
): PropertyDecorator => {
  return () => {};
};
