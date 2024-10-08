import { Index as GeneratedIndex } from '~/generated-metadata/graphql';

export type IndexMetadataItem = Omit<GeneratedIndex, '__typename'> & {
  __typename?: string;
};
