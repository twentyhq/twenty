export type PresentationObjectMetadata = {
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

export type PresentationView = {
  id: string;
  type: string;
  key: string | null;
  objectMetadataId: string;
};

export type PresentationMetadata = {
  objectMetadataItems: PresentationObjectMetadata[];
  views: PresentationView[];
  metadataVersion: number;
};

export type FindPresentationMetadataQuery = {
  presentationMetadata: PresentationMetadata;
};
