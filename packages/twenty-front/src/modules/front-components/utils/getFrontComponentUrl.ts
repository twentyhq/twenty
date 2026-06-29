import { REST_API_BASE_URL } from '@/apollo/constant/rest-api-base-url';
import { isDefined } from 'twenty-shared/utils';

export const getFrontComponentUrl = ({
  frontComponentId,
  checksum,
}: {
  frontComponentId: string;
  checksum?: string;
}): string => {
  return isDefined(checksum)
    ? `${REST_API_BASE_URL}/front-components/${frontComponentId}?checksum=${checksum}`
    : `${REST_API_BASE_URL}/front-components/${frontComponentId}`;
};
