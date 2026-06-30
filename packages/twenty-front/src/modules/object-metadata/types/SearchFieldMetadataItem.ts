import { type SearchField as GeneratedSearchField } from '~/generated-metadata/graphql';

export type SearchFieldMetadataItem = Omit<
  GeneratedSearchField,
  '__typename'
> & {
  __typename?: string;
};
