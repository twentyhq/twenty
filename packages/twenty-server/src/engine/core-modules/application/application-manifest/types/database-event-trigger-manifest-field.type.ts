import { type FieldMetadataType, type RelationType } from 'twenty-shared/types';

export type DatabaseEventTriggerManifestField = {
  universalIdentifier: string;
  name: string;
  type: FieldMetadataType;
  objectUniversalIdentifier: string;
  relationType?: RelationType;
  relationTargetObjectUniversalIdentifier?: string;
};
