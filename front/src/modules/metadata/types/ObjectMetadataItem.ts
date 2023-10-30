import { Field, Object as GeneratedObject } from '~/generated-metadata/graphql';

export type ObjectMetadataItem = Omit<
  GeneratedObject,
  'fields' | 'dataSourceId'
> & {
  fields: Field[];
};
