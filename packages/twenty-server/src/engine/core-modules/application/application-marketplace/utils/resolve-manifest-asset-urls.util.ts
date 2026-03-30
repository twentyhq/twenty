import { type Manifest } from 'twenty-shared/application';

const isAbsoluteUrl = (url: string): boolean =>
  url.startsWith('http://') || url.startsWith('https://');

export const resolveManifestAssetUrls = (
  manifest: Manifest,
  urlBuilder: (filePath: string) => string,
): Manifest => {
  const resolveUrl = (url: string): string =>
    isAbsoluteUrl(url) ? url : urlBuilder(url);

  return {
    ...manifest,
    application: {
      ...manifest.application,
      logoUrl: manifest.application.logoUrl
        ? resolveUrl(manifest.application.logoUrl)
        : undefined,
      screenshots: (manifest.application.screenshots ?? []).map(resolveUrl),
    },
  };
};
