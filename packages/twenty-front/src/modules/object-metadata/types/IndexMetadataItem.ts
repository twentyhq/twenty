import { IndexFieldMetadataItem } from '@/object-metadata/types/IndexFieldMetadataItem';
import { Index as GeneratedIndex } from '~/generated-metadata/graphql';

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
