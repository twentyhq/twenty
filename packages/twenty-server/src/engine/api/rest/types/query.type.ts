import { QueryVariables } from 'src/engine/api/rest/types/query-variables.type';

export type Query = {
  query: string;
  variables: QueryVariables;
};
