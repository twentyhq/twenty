export interface Pipe {
  id: string;
  name?: string;
  icon?: string | null;
}

export interface GraphqlQueryPipe {
  id: string;
  name?: string;
  icon?: string | null;
  __typename: string;
}
