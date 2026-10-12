import { type Manifest } from 'twenty-shared/application';

import { type EntityFilePaths } from '@/app/manifest/types/entity-file-paths.type';

export type AppManifest = {
  manifest: Manifest;
  filePaths: EntityFilePaths;
};
