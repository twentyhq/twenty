import { type IndexField as GeneratedIndexField } from '~/generated-metadata/graphql';

export type IndexFieldMetadataItem = Omit<GeneratedIndexField, '__typename'> & {
  __typename?: string;
};
