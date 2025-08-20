import { type Object as GeneratedObject } from '~/generated-metadata/graphql';

import { type IndexMetadataItem } from '@/object-metadata/types/IndexMetadataItem';
import { type FieldMetadataItem } from './FieldMetadataItem';

export type ObjectMetadataItem = Omit<
  GeneratedObject,
  | '__typename'
  | 'fields'
  | 'indexMetadatas'
  | 'labelIdentifierFieldMetadataId'
  | 'fieldsList'
  | 'indexMetadataList'
> & {
  __typename?: string;
  fields: FieldMetadataItem[];
  readableFields: FieldMetadataItem[];
  updatableFields: FieldMetadataItem[];
  labelIdentifierFieldMetadataId: string;
  indexMetadatas: IndexMetadataItem[];
};
