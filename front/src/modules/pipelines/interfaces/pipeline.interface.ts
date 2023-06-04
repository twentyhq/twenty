export interface Pipeline {
  id: string;
  name?: string;
  icon?: string | null;
}

export interface GraphqlQueryPipeline {
  id: string;
  name?: string;
  icon?: string | null;
  __typename: string;
}
