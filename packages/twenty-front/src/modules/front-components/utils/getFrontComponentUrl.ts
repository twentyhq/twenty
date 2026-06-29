import { REST_API_BASE_URL } from '@/apollo/constant/rest-api-base-url';
import { isDefined } from 'twenty-shared/utils';

const getAbsoluteRestApiBaseUrl = () => {
  return new URL(REST_API_BASE_URL, window.location.origin).toString().replace(/\/$/, '');
};

export const getFrontComponentUrl = ({
  frontComponentId,
  checksum,
}: {
  frontComponentId: string;
  checksum?: string;
}): string => {
  const frontComponentUrl = `${getAbsoluteRestApiBaseUrl()}/front-components/${frontComponentId}`;

  return isDefined(checksum)
    ? `${frontComponentUrl}?checksum=${checksum}`
    : frontComponentUrl;
};
