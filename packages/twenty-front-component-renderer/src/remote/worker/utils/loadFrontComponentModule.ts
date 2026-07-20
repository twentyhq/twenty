import { isDefined } from 'twenty-shared/utils';

import { containsSdkClientImportSpecifier } from '@/remote/worker/utils/containsSdkClientImportSpecifier';
import { createJavaScriptModuleBlobUrl } from '@/remote/worker/utils/createJavaScriptModuleBlobUrl';
import { fetchSdkClientModulesAsBlobUrls } from '@/remote/worker/utils/fetchSdkClientModulesAsBlobUrls';
import { revokeSdkClientModuleBlobUrls } from '@/remote/worker/utils/revokeSdkClientModuleBlobUrls';
import { rewriteSdkClientImportsToBlobUrls } from '@/remote/worker/utils/rewriteSdkClientImportsToBlobUrls';
import { type SdkClientUrls } from '@/types/SdkClientUrls';
import { buildAuthorizationHeadersFromAccessToken } from '@/utils/buildAuthorizationHeadersFromAccessToken';

type LoadFrontComponentModuleInput = {
  componentSource: string;
  sdkClientUrls?: SdkClientUrls;
  applicationAccessToken?: string;
};

type FrontComponentModule = {
  default: (container: Element) => void;
};

export const loadFrontComponentModule = async ({
  componentSource,
  sdkClientUrls,
  applicationAccessToken,
}: LoadFrontComponentModuleInput): Promise<FrontComponentModule> => {
  const authorizationHeaders = buildAuthorizationHeadersFromAccessToken(
    applicationAccessToken,
  );

  const sdkModuleBlobUrls =
    isDefined(sdkClientUrls) &&
    containsSdkClientImportSpecifier(componentSource)
      ? await fetchSdkClientModulesAsBlobUrls(
          sdkClientUrls,
          authorizationHeaders,
        )
      : null;

  const componentModuleSource = isDefined(sdkModuleBlobUrls)
    ? rewriteSdkClientImportsToBlobUrls(componentSource, sdkModuleBlobUrls)
    : componentSource;

  const componentModuleBlobUrl = createJavaScriptModuleBlobUrl(
    componentModuleSource,
  );

  try {
    /* @vite-ignore */
    return await import(componentModuleBlobUrl);
  } finally {
    URL.revokeObjectURL(componentModuleBlobUrl);

    if (isDefined(sdkModuleBlobUrls)) {
      revokeSdkClientModuleBlobUrls(sdkModuleBlobUrls);
    }
  }
};
