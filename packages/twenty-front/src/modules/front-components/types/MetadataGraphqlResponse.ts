import { type GraphQLFormattedError } from 'graphql';

export type MetadataGraphqlResponse<TData> = {
  status: number;
  payload: {
    data?: TData | null;
    errors?: ReadonlyArray<GraphQLFormattedError>;
  } | null;
};
