export type MetadataOwnerKind =
  | 'standard'
  | 'custom'
  | 'application'
  | 'unknown';

export type MetadataOwner = {
  kind: MetadataOwnerKind;
  applicationId: string;
  name: string | null;
};
