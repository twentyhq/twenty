import { type ApplicationManifest } from 'twenty-shared/application';
import { type ValidationError } from '../manifest.types';

export type EntityIdWithLocation = {
  id: string;
  locations: string[];
};

export type ManifestWithoutSources = Omit<
  ApplicationManifest,
  'sources' | 'packageJson'
>;

export type ManifestEntityBuilder<EntityManifest> = {
  build(appPath: string): Promise<EntityManifest>;
  validate(data: EntityManifest, errors: ValidationError[]): void;
  display(data: EntityManifest): void;
  findDuplicates(manifest: ManifestWithoutSources): EntityIdWithLocation[];
};
