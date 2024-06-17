export type QueryVariables = {
  id?: string;
  data?: object | null;
  filter?: object;
  orderBy?: object;
  limit?: number;
  startingAfter?: string;
  endingBefore?: string;
  input?: object;
};
