export type QueryVariables = {
  id?: string;
  ids?: string[];
  data?: object | null;
  filter?: object;
  orderBy?: object;
  last?: number;
  first?: number;
  startingAfter?: string;
  endingBefore?: string;
  input?: object;
};
