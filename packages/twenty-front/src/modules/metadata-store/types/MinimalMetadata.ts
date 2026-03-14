export type MinimalObjectMetadata = {
  id: string;
  nameSingular: string;
  namePlural: string;
  labelSingular: string;
  labelPlural: string;
  icon?: string;
  isCustom: boolean;
  isActive: boolean;
  isSystem: boolean;
  isRemote: boolean;
};

export type MinimalView = {
  id: string;
  type: string;
  key: string | null;
  objectMetadataId: string;
};

export type MinimalMetadata = {
  objectMetadataItems: MinimalObjectMetadata[];
  views: MinimalView[];
  metadataVersion: number;
};

export type FindMinimalMetadataQuery = {
  minimalMetadata: MinimalMetadata;
};
