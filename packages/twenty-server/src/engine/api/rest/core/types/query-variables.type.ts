export type QueryVariables = {
  id?: string;
  ids?: string[];
  data?: object | null;
  filter?: object;
  orderBy?: object;
  last?: number;
  first?: number;
  limit?: number;
  startingAfter?: string;
  endingBefore?: string;
  input?: object;
  depth?: 0 | 1 | 2;
};
