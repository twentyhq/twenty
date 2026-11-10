import {
  FIND_MY_PRIVATE_VIEWS_GRAPHQL_OPERATION,
  FIND_SHARED_VIEWS_GRAPHQL_OPERATION,
} from 'src/engine/metadata-modules/view/constants/view-family-graphql-operations.constant';

export const METADATA_GRAPHQL_OPERATIONS_TO_PIN: ReadonlySet<string> = new Set([
  FIND_SHARED_VIEWS_GRAPHQL_OPERATION,
  FIND_MY_PRIVATE_VIEWS_GRAPHQL_OPERATION,
]);
