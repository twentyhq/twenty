import { type ValidationError } from '../manifest.types';

export type DuplicateId = {
  id: string;
  locations: string[];
};

export type ManifestEntityBuilder<TManifest> = {
  build(appPath: string): Promise<TManifest>;
  validate(data: TManifest, errors: ValidationError[]): void;
  display(data: TManifest): void;
  findDuplicates(data: TManifest): DuplicateId[];
};
