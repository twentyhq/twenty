export type MetadataQueryVariables = {
  id?: string;
  input?: object;
  paging?: {
    first?: number;
    after?: string;
    before?: string;
  };
};
