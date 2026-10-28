import {
  type ObjectManifest,
  type ObjectPermissionAction,
} from 'twenty-shared/application';
import {
  MetadataReadability,
  MetadataWritability,
  ObjectOpenRecordIn,
  ObjectSharingReach,
} from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

// TODO: remove once published app manifests declare disabledObjectPermissionActions
const resolveManifestObjectDisabledObjectPermissionActions = (
  objectManifest: ObjectManifest,
): UniversalFlatObjectMetadata['disabledObjectPermissionActions'] => {
  if (isDefined(objectManifest.disabledObjectPermissionActions)) {
    return objectManifest.disabledObjectPermissionActions;
  }

  const isWriteRestricted =
    objectManifest.writability === MetadataWritability.APPLICATION ||
    objectManifest.writability === MetadataWritability.SYSTEM;
  const isReadRestricted =
    objectManifest.readability === MetadataReadability.APPLICATION ||
    objectManifest.readability === MetadataReadability.SYSTEM;

  const disabledObjectPermissionActions: ObjectPermissionAction[] = [
    ...(isWriteRestricted
      ? ([
          'canUpdateObjectRecords',
          'canSoftDeleteObjectRecords',
          'canDestroyObjectRecords',
        ] as const)
      : []),
    ...(isReadRestricted ? (['canReadObjectRecords'] as const) : []),
  ];

  return isNonEmptyArray(disabledObjectPermissionActions)
    ? disabledObjectPermissionActions
    : null;
};

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
    readabilityParentFieldUniversalIdentifiers:
      objectManifest.readabilityParentFieldUniversalIdentifiers ?? null,
    disabledObjectPermissionActions:
      resolveManifestObjectDisabledObjectPermissionActions(objectManifest),
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
