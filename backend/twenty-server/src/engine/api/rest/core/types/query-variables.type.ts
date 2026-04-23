import { type ObjectRecordOrderBy } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

export type QueryVariables = {
  id?: string;
  ids?: string[];
  data?: object | null;
  filter?: object;
  orderBy?: ObjectRecordOrderBy;
  last?: number;
  first?: number;
  startingAfter?: string;
  endingBefore?: string;
  input?: object;
};
