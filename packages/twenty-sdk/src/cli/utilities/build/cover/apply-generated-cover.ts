import { readFile } from 'node:fs/promises';
import { basename, extname, join } from 'path';
import { type AssetManifest, type Manifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { generateCoverImage } from '@/cli/utilities/build/cover/generate-cover-image';
import { type GeneratedAsset } from '@/cli/utilities/build/cover/generated-asset.type';
import { GENERATED_COVER_PATH } from '@/cli/utilities/build/cover/generated-cover-path';
import { pathExists } from '@/cli/utilities/file/fs-utils';

const isAbsoluteUrl = (url: string): boolean =>
  url.startsWith('http://') || url.startsWith('https://');

export const applyGeneratedCover = async ({
  appPath,
  manifest,
}: {
  appPath: string;
  manifest: Manifest;
}): Promise<{ manifest: Manifest; generatedAssets: GeneratedAsset[] }> => {
  const { logoUrl, screenshots } = manifest.application;

  if (!isDefined(logoUrl) || isAbsoluteUrl(logoUrl)) {
    return { manifest, generatedAssets: [] };
  }

  if ((screenshots ?? []).length > 0) {
    return { manifest, generatedAssets: [] };
  }

  const logoPath = join(appPath, logoUrl);

  if (!(await pathExists(logoPath))) {
    return { manifest, generatedAssets: [] };
  }

  const logoBuffer = await readFile(logoPath);
  const coverBuffer = await generateCoverImage({ logoBuffer });

  const coverAsset: AssetManifest = {
    filePath: GENERATED_COVER_PATH,
    fileName: basename(GENERATED_COVER_PATH),
    fileType: extname(GENERATED_COVER_PATH).replace(/^\./, ''),
    checksum: null,
  };

  const publicAssets = [
    ...manifest.publicAssets.filter(
      (asset) => asset.filePath !== GENERATED_COVER_PATH,
    ),
    coverAsset,
  ];

  return {
    manifest: {
      ...manifest,
      application: {
        ...manifest.application,
        screenshots: [GENERATED_COVER_PATH],
      },
      publicAssets,
    },
    generatedAssets: [
      { relativePath: GENERATED_COVER_PATH, content: coverBuffer },
    ],
  };
};
