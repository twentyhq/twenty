import { type SourceFileManifest } from 'twenty-shared/application';

export type ApplicationSourceResource = {
  kind: 'frontComponent' | 'logicFunction';
  universalIdentifier: string;
  sourcePath: string;
  inventoryPath: string;
  sourceFiles?: SourceFileManifest[];
  metadata: Record<string, unknown>;
};
