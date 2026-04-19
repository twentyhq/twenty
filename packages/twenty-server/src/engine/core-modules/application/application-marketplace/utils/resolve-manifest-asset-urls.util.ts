import { type Manifest } from 'twenty-shared/application';

const isAbsoluteUrl = (Url: string): boolean =>
  Url.startsWith('http://') || Url.startsWith('https://');

export const resolveManifestAssetUrls = (
  manifest: Manifest,
  urlBuilder: (filePath: string) => string,
): Manifest => {
  const resolveUrl = (Url: string): string =>
    isAbsoluteUrl(Url) ? Url : urlBuilder(Url);

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
