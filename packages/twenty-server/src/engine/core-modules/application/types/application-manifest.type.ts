import { type FlatAgent } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export type ApplicationManifest = {
  standardId: string;
  label: string;
  description?: string;
  icon?: string;
  version: string;
  agents?: FlatAgent[];
  objects?: FlatObjectMetadata[];
};
