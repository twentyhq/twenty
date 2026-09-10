import { REST_API_BASE_URL } from '@/apollo/constant/rest-api-base-url';
import { isDefined } from 'twenty-shared/utils';

export const getFingerprintedRestUrl = ({
  resource,
  id,
  checksum,
}: {
  resource: 'front-components' | 'front-component-shared-dependencies';
  id: string;
  checksum?: string;
}): string =>
  isDefined(checksum)
    ? `${REST_API_BASE_URL}/${resource}/${id}/${checksum}.js`
    : `${REST_API_BASE_URL}/${resource}/${id}`;
