import { type FlatAgent } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';

export type ApplicationManifest = {
  universalIdentifier: string;
  label: string;
  description?: string;
  icon?: string;
  version: string;
  agents: FlatAgent[];
};
