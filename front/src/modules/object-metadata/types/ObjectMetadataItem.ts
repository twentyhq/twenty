import { Object as GeneratedObject } from '~/generated-metadata/graphql';

import { FieldMetadataItem } from './FieldMetadataItem';

export type ObjectMetadataItem = Omit<
  GeneratedObject,
  'fields' | 'dataSourceId'
> & {
  fields: FieldMetadataItem[];
};
