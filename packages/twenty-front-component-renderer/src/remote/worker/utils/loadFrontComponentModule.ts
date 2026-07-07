import { isDefined } from 'twenty-shared/utils';

import { containsSdkClientImportSpecifier } from '@/remote/worker/utils/containsSdkClientImportSpecifier';
import { createJavaScriptModuleBlobUrl } from '@/remote/worker/utils/createJavaScriptModuleBlobUrl';
import { fetchJavaScriptModuleSourceText } from '@/remote/worker/utils/fetchJavaScriptModuleSourceText';
import { fetchSdkClientModulesAsBlobUrls } from '@/remote/worker/utils/fetchSdkClientModulesAsBlobUrls';
import { rewriteSdkClientImportsToBlobUrls } from '@/remote/worker/utils/rewriteSdkClientImportsToBlobUrls';
import { type SdkClientUrls } from '@/types/SdkClientUrls';

type LoadFrontComponentModuleInput = {
  componentUrl: string;
  sdkClientUrls?: SdkClientUrls;
  applicationAccessToken?: string;
};

type FrontComponentModule = {
  default: (container: Element) => void;
};

export const loadFrontComponentModule = async ({
  componentUrl,
  sdkClientUrls,
  applicationAccessToken,
}: LoadFrontComponentModuleInput): Promise<FrontComponentModule> => {
  const authorizationHeaders = isDefined(applicationAccessToken)
    ? { Authorization: `Bearer ${applicationAccessToken}` }
    : undefined;

  const componentSource = await fetchJavaScriptModuleSourceText(
    componentUrl,
    authorizationHeaders,
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
      URL.revokeObjectURL(sdkModuleBlobUrls.core);
      URL.revokeObjectURL(sdkModuleBlobUrls.metadata);
    }
  }
};
