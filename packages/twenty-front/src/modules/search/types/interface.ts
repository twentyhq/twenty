import { DocumentNode } from 'graphql';

export type SearchConfigType = {
  query: DocumentNode;
  template: (
    searchInput: string,
    currentSelectedId?: string,
  ) => Record<string, unknown>;
  resultMapper: (data: unknown) => unknown;
};
