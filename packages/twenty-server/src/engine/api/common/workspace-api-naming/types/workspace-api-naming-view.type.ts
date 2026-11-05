import { type MetadataTechnicalNamesByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/types/metadata-technical-names-by-universal-identifier.type';

export type WorkspaceApiNamingView =
  MetadataTechnicalNamesByUniversalIdentifier & {
    readonly id: string;
  };
