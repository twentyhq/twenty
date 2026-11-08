import {
  type DisableableObjectPermissionAction,
  type ObjectManifest,
} from 'twenty-shared/application';
import { ObjectOpenRecordIn } from 'twenty-shared/types';

import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

// Disabling update has always blocked creating too, and manifests only declare it from here on
const addDisabledCreateToDisabledUpdate = (
  disabledActions: DisableableObjectPermissionAction[] | undefined,
) =>
  disabledActions?.includes('canUpdateObjectRecords') &&
  !disabledActions.includes('canCreateObjectRecords')
    ? [...disabledActions, 'canCreateObjectRecords' as const]
    : disabledActions;

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
    disabledObjectPermissionActions:
      addDisabledCreateToDisabledUpdate(
        objectManifest.disabledObjectPermissionActions,
      ) ?? null,
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
