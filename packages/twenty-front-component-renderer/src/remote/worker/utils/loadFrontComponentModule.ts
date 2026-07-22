import { isDefined } from 'twenty-shared/utils';

import { createJavaScriptModuleBlobUrl } from '@/remote/worker/utils/createJavaScriptModuleBlobUrl';
import { createSdkClientModuleBlobUrls } from '@/remote/worker/utils/createSdkClientModuleBlobUrls';
import { revokeSdkClientModuleBlobUrls } from '@/remote/worker/utils/revokeSdkClientModuleBlobUrls';
import { rewriteSdkClientImportsToBlobUrls } from '@/remote/worker/utils/rewriteSdkClientImportsToBlobUrls';
import { type SdkClientSources } from '@/types/SdkClientSources';

type LoadFrontComponentModuleInput = {
  componentSource: string;
  sdkClientSources?: SdkClientSources;
};

type FrontComponentModule = {
  default: (container: Element) => void;
};

export const loadFrontComponentModule = async ({
  componentSource,
  sdkClientSources,
}: LoadFrontComponentModuleInput): Promise<FrontComponentModule> => {
  const sdkModuleBlobUrls = isDefined(sdkClientSources)
    ? createSdkClientModuleBlobUrls(sdkClientSources)
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
