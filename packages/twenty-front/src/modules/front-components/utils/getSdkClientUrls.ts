import { REST_API_BASE_URL } from '@/apollo/constant/rest-api-base-url';

export const getSdkClientUrls = (applicationId: string) => ({
  core: `${REST_API_BASE_URL}/sdk-client/${applicationId}/core`,
  metadata: `${REST_API_BASE_URL}/sdk-client/${applicationId}/metadata`,
});
