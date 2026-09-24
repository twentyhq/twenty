import { type MetadataGraphqlResponse } from '@/front-components/types/MetadataGraphqlResponse';
import { isUnauthenticatedMetadataGraphqlResponse } from '@/front-components/utils/isUnauthenticatedMetadataGraphqlResponse';

export const sendMetadataGraphqlOperationWithOneRetryOnUnauthenticated = async <
  TData,
>({
  applicationAccessToken,
  requestAccessTokenRefresh,
  sendOperation,
}: {
  applicationAccessToken: string;
  requestAccessTokenRefresh: () => Promise<string>;
  sendOperation: (
    applicationAccessToken: string,
  ) => Promise<MetadataGraphqlResponse<TData>>;
}): Promise<MetadataGraphqlResponse<TData>> => {
  const response = await sendOperation(applicationAccessToken);

  if (!isUnauthenticatedMetadataGraphqlResponse(response)) {
    return response;
  }

  return sendOperation(await requestAccessTokenRefresh());
};
