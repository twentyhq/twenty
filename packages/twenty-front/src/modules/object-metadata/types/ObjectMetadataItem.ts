import { Object as GeneratedObject } from '~/generated-metadata/graphql';

import { IndexMetadataItem } from '@/object-metadata/types/IndexMetadataItem';
import { FieldMetadataItem } from './FieldMetadataItem';

export type ObjectMetadataItem = Omit<
  GeneratedObject,
  | '__typename'
  | 'fields'
  | 'dataSourceId'
  | 'indexMetadatas'
  | 'labelIdentifierFieldMetadataId'
  | 'fieldsList'
> & {
  __typename?: string;
  fields: FieldMetadataItem[];
  labelIdentifierFieldMetadataId: string;
  indexMetadatas: IndexMetadataItem[];
};
