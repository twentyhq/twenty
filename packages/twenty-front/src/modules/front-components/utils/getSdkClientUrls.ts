import { REST_API_BASE_URL } from '@/apollo/constant/rest-api-base-url';
import { isDefined } from 'twenty-shared/utils';
import { type SdkClientChecksums } from '~/generated-metadata/graphql';

export const getSdkClientUrls = (
  applicationId: string,
  checksums?: Pick<SdkClientChecksums, 'core' | 'metadata'> | null,
) => {
  const applicationBaseUrl = `${REST_API_BASE_URL}/sdk-client/${applicationId}`;
  const metadataBaseUrl = `${REST_API_BASE_URL}/sdk-client/metadata`;

  const coreChecksum = checksums?.core;
  const metadataChecksum = checksums?.metadata;

  return {
    core: isDefined(coreChecksum)
      ? `${applicationBaseUrl}/core/${coreChecksum}`
      : `${applicationBaseUrl}/core`,
    metadata: isDefined(metadataChecksum)
      ? `${metadataBaseUrl}/${metadataChecksum}`
      : metadataBaseUrl,
  };
};
