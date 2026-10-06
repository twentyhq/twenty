import { type ManifestEntityKey } from '@/app/source/extract-define-entity';

export type EntityFilePaths = Record<
  ManifestEntityKey | 'publicAssets',
  string[]
>;
