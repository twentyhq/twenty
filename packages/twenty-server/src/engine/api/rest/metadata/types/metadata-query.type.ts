import { MetadataQueryVariables } from 'src/engine/api/rest/metadata/types/metadata-query-variables.type';

export type MetadataQuery = {
  query: string;
  variables: MetadataQueryVariables;
};
