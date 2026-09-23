import { isUnauthenticatedGraphQLError } from '@/apollo/utils/isUnauthenticatedGraphQLError';
import { type MetadataGraphqlResponse } from '@/front-components/types/MetadataGraphqlResponse';

export const isUnauthenticatedMetadataGraphqlResponse = (
  response: MetadataGraphqlResponse<unknown>,
): boolean =>
  response.status === 401 ||
  response.payload?.errors?.some(isUnauthenticatedGraphQLError) === true;
