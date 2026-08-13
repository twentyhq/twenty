import { buildModuleImportContextPattern } from '@/utils/buildModuleImportContextPattern';

export const rewriteModuleImportsToBlobUrls = (
  source: string,
  blobUrlBySpecifier: Record<string, string>,
): string => {
  let rewrittenSource = source;

  for (const [specifier, blobUrl] of Object.entries(blobUrlBySpecifier)) {
    rewrittenSource = rewrittenSource.replace(
      buildModuleImportContextPattern(specifier),
      (_fullMatch, importContext: string, quote: string) =>
        `${importContext}${quote}${blobUrl}${quote}`,
    );
  }

  return rewrittenSource;
};
