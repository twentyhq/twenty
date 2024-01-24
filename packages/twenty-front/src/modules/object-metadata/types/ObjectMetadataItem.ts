import { Object as GeneratedObject } from '~/generated-metadata/graphql';

import { FieldMetadataItem } from './FieldMetadataItem';

export type ObjectMetadataItem = Omit<
  GeneratedObject,
  '__typename' | 'fields' | 'dataSourceId'
> & {
  __typename?: string;
  fields: FieldMetadataItem[];
};
