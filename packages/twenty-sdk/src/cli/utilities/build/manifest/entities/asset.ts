import { glob } from 'fast-glob';
import path from 'path';
import { type AssetManifest } from 'twenty-shared/application';

import { type EntityBuildResult } from '@/cli/utilities/build/manifest/entities/entity-interface';

export const ASSETS_DIR = 'public';

export class AssetEntityBuilder {
  async build(appPath: string): Promise<EntityBuildResult<AssetManifest>> {
    const assetFiles = await glob([`${ASSETS_DIR}/**/*`], {
      cwd: appPath,
      onlyFiles: true,
    });

    const manifests: AssetManifest[] = assetFiles.map((filePath) => ({
      filePath,
      fileName: path.basename(filePath),
      fileType: path.extname(filePath).replace(/^\./, ''),
      checksum: null,
    }));

    return { manifests, filePaths: assetFiles };
  }
}

export const assetEntityBuilder = new AssetEntityBuilder();
