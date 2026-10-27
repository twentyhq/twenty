import { type ObjectManifest } from 'twenty-shared/application';
import { ObjectOpenRecordIn, ObjectSharingReach } from 'twenty-shared/types';

import { resolveObjectManifestRecordAccess } from 'src/engine/core-modules/application/application-manifest/utils/resolve-object-manifest-record-access.util';
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
    ...resolveObjectManifestRecordAccess(objectManifest),
    readabilityParentFieldUniversalIdentifiers:
      objectManifest.readabilityParentFieldUniversalIdentifiers ?? null,
    sharingReach: objectManifest.sharingReach ?? ObjectSharingReach.WORKSPACE,
    isAuditLogged: true,
    isSearchable: objectManifest.isSearchable ?? true,
    duplicateCriteria: null,
    shortcut: null,
    isLabelSyncedWithName: objectManifest.isLabelSyncedWithName ?? false,
    fieldUniversalIdentifiers: [],
    indexMetadataUniversalIdentifiers: [],
    searchFieldMetadataUniversalIdentifiers: [],
    navigationMenuItemUniversalIdentifiers: [],
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
