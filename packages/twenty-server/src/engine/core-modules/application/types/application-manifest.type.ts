import { type FlatAgent } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';

export type ApplicationManifest = {
  standardId: string;
  label: string;
  description?: string;
  icon?: string;
  version: string;
  agents: FlatAgent[];
};
