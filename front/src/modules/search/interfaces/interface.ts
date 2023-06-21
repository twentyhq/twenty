import { DocumentNode } from 'graphql';

export type SearchConfigType = {
  query: DocumentNode;
  template: (searchInput: string) => any;
  resultMapper: (data: any) => any;
};
