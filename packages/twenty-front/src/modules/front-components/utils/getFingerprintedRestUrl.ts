import { REST_API_BASE_URL } from '@/apollo/constants/RestApiBaseUrl';
import { isDefined } from 'twenty-shared/utils';

export const getFingerprintedRestUrl = ({
  resource,
  id,
  checksum,
}: {
  resource: 'front-components' | 'front-component-shared-dependencies';
  id: string;
  checksum?: string;
}): string => {
  const resourceUrl = `${REST_API_BASE_URL}/${resource}/${id}`;

  if (!isDefined(checksum)) {
    return resourceUrl;
  }

  const isSharedDependencies =
    resource === 'front-component-shared-dependencies';
  const cacheKey = isSharedDependencies ? checksum : `${checksum}.js`;

  return `${resourceUrl}/${cacheKey}`;
};
