import { type MetadataQueryVariables } from 'src/engine/api/rest/metadata/types/metadata-query-variables.type';

export type MetadataQuery = {
  query: string;
  variables: MetadataQueryVariables;
};

export type Selectors =
  | { fields?: Array<string>; objects?: Array<string> }
  | undefined;
