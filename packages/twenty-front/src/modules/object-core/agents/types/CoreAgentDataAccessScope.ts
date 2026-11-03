export type CoreAgentDataAccessScope =
  | { type: 'global' }
  | { type: 'object'; objectMetadataId: string };
