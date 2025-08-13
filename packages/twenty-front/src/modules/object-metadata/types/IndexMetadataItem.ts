import { type IndexFieldMetadataItem } from '@/object-metadata/types/IndexFieldMetadataItem';
import { type Index as GeneratedIndex } from '~/generated-metadata/graphql';

export type IndexMetadataItem = Omit<
  GeneratedIndex,
  | '__typename'
  | 'indexFieldMetadatas'
  | 'objectMetadata'
  | 'indexFieldMetadataList'
> & {
  __typename?: string;
  indexFieldMetadatas: IndexFieldMetadataItem[];
};
