import { useApplicationSdkClient } from '@/front-components/hooks/useApplicationSdkClient';
import { type FrontComponentExecutionContext } from 'twenty-sdk/front-component-renderer';
import { FrontComponentRenderer as SharedFrontComponentRenderer } from 'twenty-sdk/front-component-renderer';
import { type FrontComponentHostCommunicationApi } from 'twenty-sdk/front-component-renderer';
import { isDefined } from 'twenty-shared/utils';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

type FrontComponentRendererWithSdkClientProps = {
  colorScheme: 'light' | 'dark';
  componentUrl: string;
  applicationAccessToken: string;
  applicationId: string;
  executionContext: FrontComponentExecutionContext;
  frontComponentHostCommunicationApi: FrontComponentHostCommunicationApi;
  onError: (error?: Error) => void;
};

export const FrontComponentRendererWithSdkClient = ({
  colorScheme,
  componentUrl,
  applicationAccessToken,
  applicationId,
  executionContext,
  frontComponentHostCommunicationApi,
  onError,
}: FrontComponentRendererWithSdkClientProps) => {
  const { sdkClientBlobUrls, isLoading } = useApplicationSdkClient({
    applicationId,
    accessToken: applicationAccessToken,
    onError,
  });

  if (isLoading || !isDefined(sdkClientBlobUrls)) {
    return null;
  }

  return (
    <SharedFrontComponentRenderer
      colorScheme={colorScheme}
      componentUrl={componentUrl}
      applicationAccessToken={applicationAccessToken}
      apiUrl={REACT_APP_SERVER_BASE_URL}
      sdkClientUrls={sdkClientBlobUrls}
      executionContext={executionContext}
      frontComponentHostCommunicationApi={frontComponentHostCommunicationApi}
      onError={onError}
    />
  );
};
