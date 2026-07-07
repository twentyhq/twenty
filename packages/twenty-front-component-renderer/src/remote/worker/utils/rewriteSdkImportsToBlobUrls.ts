import { type SDK_IMPORT_SPECIFIERS } from '@/remote/worker/constants/SdkImportSpecifiers';
import { type SdkClientUrls } from '@/types/SdkClientUrls';

export const rewriteSdkImportsToBlobUrls = (
  source: string,
  sdkModuleBlobUrls: SdkClientUrls,
): string => {
  const specifierToBlobUrl: Record<
    (typeof SDK_IMPORT_SPECIFIERS)[number],
    string
  > = {
    'twenty-client-sdk/core': sdkModuleBlobUrls.core,
    'twenty-client-sdk/metadata': sdkModuleBlobUrls.metadata,
  };

  let rewrittenSource = source;

  for (const [specifier, blobUrl] of Object.entries(specifierToBlobUrl)) {
    rewrittenSource = rewrittenSource
      .split(`"${specifier}"`)
      .join(`"${blobUrl}"`)
      .split(`'${specifier}'`)
      .join(`'${blobUrl}'`);
  }

  return rewrittenSource;
};
