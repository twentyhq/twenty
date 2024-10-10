import { Object as GeneratedObject } from '~/generated-metadata/graphql';

import { IndexMetadataItem } from '@/object-metadata/types/IndexMetadataItem';
import { FieldMetadataItem } from './FieldMetadataItem';

export type ObjectMetadataItem = Omit<
  GeneratedObject,
  '__typename' | 'fields' | 'dataSourceId' | 'indexMetadatas'
> & {
  __typename?: string;
  fields: FieldMetadataItem[];
  indexMetadatas: IndexMetadataItem[];
};
