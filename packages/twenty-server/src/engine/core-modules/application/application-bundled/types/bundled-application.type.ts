import { type Manifest } from 'twenty-shared/application';

// A manifest-only app shipped in the server source: no logic functions, front components or assets
export type BundledApplication = {
  version: string;
  manifest: Manifest;
};
