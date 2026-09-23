import { isDefined } from 'twenty-shared/utils';

import { type MetadataGraphqlResponse } from '@/front-components/types/MetadataGraphqlResponse';

export const unwrapMetadataGraphqlResponseOrThrow = <TData>(
  response: MetadataGraphqlResponse<TData>,
): TData => {
  const [firstError] = response.payload?.errors ?? [];

  if (isDefined(firstError)) {
    throw new Error(firstError.message);
  }

  if (response.status < 200 || response.status >= 300) {
    throw new Error(`Metadata request failed with status ${response.status}`);
  }

  const data = response.payload?.data;

  if (!isDefined(data)) {
    throw new Error('Empty GraphQL response');
  }

  return data;
};
