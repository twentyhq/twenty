import { type QueryVariables } from 'src/engine/api/rest/core/types/query-variables.type';

export type Query = {
  query: string;
  variables: QueryVariables;
};
