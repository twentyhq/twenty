import { type GRAPHQL_ENDPOINT_PATHS } from '@/transport/graphql/constants/graphql-endpoint-paths.constant';

export type GraphqlEndpoint = keyof typeof GRAPHQL_ENDPOINT_PATHS;
