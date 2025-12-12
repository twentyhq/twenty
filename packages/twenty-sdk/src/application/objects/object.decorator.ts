import { type ObjectManifest } from 'twenty-shared/application';

type ObjectMetadataOptions = Omit<ObjectManifest, 'fields'>;

export const Object = (_: ObjectMetadataOptions): ClassDecorator => {
  return () => {};
};
