import { type ObjectManifest } from 'twenty-shared/application';
import {
  MetadataReadability,
  MetadataWritability,
  ObjectOpenRecordIn,
} from 'twenty-shared/types';

import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

export const fromObjectManifestToUniversalFlatObjectMetadata = ({
  objectManifest,
  applicationUniversalIdentifier,
  now,
}: {
  objectManifest: ObjectManifest;
  applicationUniversalIdentifier: string;
  now: string;
}): UniversalFlatObjectMetadata => {
  return {
    universalIdentifier: objectManifest.universalIdentifier,
    applicationUniversalIdentifier,
    nameSingular: objectManifest.nameSingular,
    namePlural: objectManifest.namePlural,
    labelSingular: objectManifest.labelSingular,
    labelPlural: objectManifest.labelPlural,
    color: objectManifest.color ?? null,
    openRecordIn: objectManifest.openRecordIn ?? ObjectOpenRecordIn.USER_CHOICE,
    description: objectManifest.description ?? null,
    icon: objectManifest.icon ?? null,
    overrides: null,
    targetTableName: 'DEPRECATED',
    isRemote: false,
    isActive: true,
    isSystem: false,
    isUIEditable: objectManifest.isUIEditable ?? true,
    isUICreatable: objectManifest.isUICreatable ?? true,
    writability: objectManifest.writability ?? MetadataWritability.OPEN,
    readability: objectManifest.readability ?? MetadataReadability.OPEN,
    isAuditLogged: true,
    isSearchable: objectManifest.isSearchable ?? true,
    duplicateCriteria: null,
    shortcut: null,
    isLabelSyncedWithName: objectManifest.isLabelSyncedWithName ?? false,
    fieldUniversalIdentifiers: [],
    indexMetadataUniversalIdentifiers: [],
    searchFieldMetadataUniversalIdentifiers: [],
    commandMenuItemUniversalIdentifiers: [],
    objectPermissionUniversalIdentifiers: [],
    fieldPermissionUniversalIdentifiers: [],
    viewUniversalIdentifiers: [],
    pageLayoutUniversalIdentifiers: [],
    labelIdentifierFieldMetadataUniversalIdentifier:
      objectManifest.labelIdentifierFieldMetadataUniversalIdentifier,
    imageIdentifierFieldMetadataUniversalIdentifier:
      objectManifest.imageIdentifierFieldMetadataUniversalIdentifier ?? null,
    createdAt: now,
    updatedAt: now,
  };
};
