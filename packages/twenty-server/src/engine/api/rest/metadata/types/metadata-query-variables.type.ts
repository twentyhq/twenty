export type MetadataQueryVariables = {
  id?: string;
  input?: object;
  paging?: {
    first?: number;
    last?: number;
    after?: string;
    before?: string;
  };
};
