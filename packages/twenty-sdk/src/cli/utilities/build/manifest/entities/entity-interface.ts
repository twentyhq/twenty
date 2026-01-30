import { type ApplicationManifest } from 'twenty-shared/application';
import { type ValidationError } from '@/cli/utilities/build/manifest/manifest-types';

export type EntityIdWithLocation = {
  id: string;
  locations: string[];
};

export type ManifestWithoutSources = Omit<
  ApplicationManifest,
  'sources' | 'packageJson' | 'yarnLock'
>;

export type EntityBuildResult<TManifest> = {
  manifests: TManifest[];
  filePaths: string[];
};

export type ManifestEntityBuilder<EntityManifest> = {
  build(appPath: string): Promise<EntityBuildResult<EntityManifest>>;
  validate(data: EntityManifest[], errors: ValidationError[]): void;
  findDuplicates(manifest: ManifestWithoutSources): EntityIdWithLocation[];
};
