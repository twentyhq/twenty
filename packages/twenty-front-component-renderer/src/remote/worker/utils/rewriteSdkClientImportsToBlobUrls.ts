import { type SDK_CLIENT_IMPORT_SPECIFIERS } from '@/remote/worker/constants/SdkClientImportSpecifiers';
import { type SdkClientUrls } from '@/types/SdkClientUrls';

const escapeRegExpToken = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildImportContextPattern = (specifier: string): RegExp =>
  new RegExp(
    `(\\bfrom\\s*|\\bimport\\s*\\(\\s*|\\bimport\\s*)(["'])${escapeRegExpToken(specifier)}\\2`,
    'g',
  );

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
      buildImportContextPattern(specifier),
      (_fullMatch, importContext: string, quote: string) =>
        `${importContext}${quote}${blobUrl}${quote}`,
    );
  }

  return rewrittenSource;
};
