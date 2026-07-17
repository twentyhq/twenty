import { REST_API_BASE_URL } from '@/apollo/constant/rest-api-base-url';
import { isDefined } from 'twenty-shared/utils';

export type SdkClientChecksums = {
  core: string;
  metadata: string;
};

export const getSdkClientUrls = (
  applicationId: string,
  checksums?: SdkClientChecksums | null,
) => {
  const baseUrl = `${REST_API_BASE_URL}/sdk-client/${applicationId}`;

  return {
    core: isDefined(checksums)
      ? `${baseUrl}/core/${checksums.core}.js`
      : `${baseUrl}/core`,
    metadata: isDefined(checksums)
      ? `${baseUrl}/metadata/${checksums.metadata}.js`
      : `${baseUrl}/metadata`,
  };
};
