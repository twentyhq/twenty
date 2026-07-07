import { isDefined } from 'twenty-shared/utils';

import { containsSdkImportSpecifier } from '@/remote/worker/utils/containsSdkImportSpecifier';
import { createJavaScriptModuleBlobUrl } from '@/remote/worker/utils/createJavaScriptModuleBlobUrl';
import { fetchModuleSourceText } from '@/remote/worker/utils/fetchModuleSourceText';
import { loadSdkModuleBlobUrls } from '@/remote/worker/utils/loadSdkModuleBlobUrls';
import { rewriteSdkImportsToBlobUrls } from '@/remote/worker/utils/rewriteSdkImportsToBlobUrls';
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

  const componentSource = await fetchModuleSourceText(
    componentUrl,
    authorizationHeaders,
  );

  const sdkModuleBlobUrls =
    isDefined(sdkClientUrls) && containsSdkImportSpecifier(componentSource)
      ? await loadSdkModuleBlobUrls(sdkClientUrls, authorizationHeaders)
      : null;

  const componentModuleSource = isDefined(sdkModuleBlobUrls)
    ? rewriteSdkImportsToBlobUrls(componentSource, sdkModuleBlobUrls)
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
