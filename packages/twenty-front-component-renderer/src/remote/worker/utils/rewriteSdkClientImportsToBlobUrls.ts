import { type SDK_CLIENT_IMPORT_SPECIFIERS } from '@/constants/SdkClientImportSpecifiers';
import { type SdkClientUrls } from '@/types/SdkClientUrls';
import { buildSdkClientImportContextPattern } from '@/utils/buildSdkClientImportContextPattern';

export const rewriteSdkClientImportsToBlobUrls = (
  source: string,
  sdkModuleBlobUrls: SdkClientUrls,
): string => {
  const specifierToBlobUrl: Record<
    (typeof SDK_CLIENT_IMPORT_SPECIFIERS)[number],
    string
  > = {
    'twenty-client-sdk/core': sdkModuleBlobUrls.core,
    'twenty-client-sdk/metadata': sdkModuleBlobUrls.metadata,
  };

  let rewrittenSource = source;

  for (const [specifier, blobUrl] of Object.entries(specifierToBlobUrl)) {
    rewrittenSource = rewrittenSource.replace(
      buildSdkClientImportContextPattern(specifier),
      (_fullMatch, importContext: string, quote: string) =>
        `${importContext}${quote}${blobUrl}${quote}`,
    );
  }

  return rewrittenSource;
};
