import { REST_API_BASE_URL } from '@/apollo/constant/rest-api-base-url';
import { isDefined } from 'twenty-shared/utils';
import { type SdkClientChecksums } from '~/generated-metadata/graphql';

export const getSdkClientUrls = (
  applicationId: string,
  checksums?: Pick<SdkClientChecksums, 'core' | 'metadata'> | null,
) => {
  const baseUrl = `${REST_API_BASE_URL}/sdk-client/${applicationId}`;

  return {
    core: isDefined(checksums)
      ? `${baseUrl}/core/${checksums.core}`
      : `${baseUrl}/core`,
    metadata: isDefined(checksums)
      ? `${baseUrl}/metadata/${checksums.metadata}`
      : `${baseUrl}/metadata`,
  };
};
