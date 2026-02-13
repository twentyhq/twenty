import { type ObjectManifest } from 'twenty-shared/application';

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
    description: objectManifest.description ?? null,
    icon: objectManifest.icon ?? null,
    standardOverrides: null,
    targetTableName: 'DEPRECATED',
    isCustom: true,
    isRemote: false,
    isActive: true,
    isSystem: false,
    isUIReadOnly: false,
    isAuditLogged: true,
    isSearchable: false,
    duplicateCriteria: null,
    shortcut: null,
    isLabelSyncedWithName: true,
    fieldUniversalIdentifiers: [],
    indexMetadataUniversalIdentifiers: [],
    viewUniversalIdentifiers: [],
    labelIdentifierFieldMetadataUniversalIdentifier: null,
    imageIdentifierFieldMetadataUniversalIdentifier: null,
    createdAt: now,
    updatedAt: now,
  };
};
