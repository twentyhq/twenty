import { REST_API_BASE_URL } from '@/apollo/constant/rest-api-base-url';
import { isDefined } from 'twenty-shared/utils';

export const getApplicationVendorUrl = ({
  applicationId,
  checksum,
}: {
  applicationId: string;
  checksum?: string;
}): string => {
  return isDefined(checksum)
    ? `${REST_API_BASE_URL}/application-vendor/${applicationId}/${checksum}.js`
    : `${REST_API_BASE_URL}/application-vendor/${applicationId}`;
};
