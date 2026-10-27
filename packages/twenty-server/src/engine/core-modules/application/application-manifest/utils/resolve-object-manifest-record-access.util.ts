import {
  type ObjectManifest,
  type ObjectPermissionAction,
} from 'twenty-shared/application';
import { MetadataReadability, MetadataWritability } from 'twenty-shared/types';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { isLegacyApplicationMetadataAccess } from 'src/engine/core-modules/application/application-manifest/utils/is-legacy-application-metadata-access.util';

const APPLICATION_WRITABILITY_DISABLED_ACTIONS: ObjectPermissionAction[] = [
  'canUpdateObjectRecords',
  'canSoftDeleteObjectRecords',
  'canDestroyObjectRecords',
];

const APPLICATION_READABILITY_DISABLED_ACTIONS: ObjectPermissionAction[] = [
  'canReadObjectRecords',
];

export const resolveObjectManifestRecordAccess = (
  objectManifest: Pick<
    ObjectManifest,
    'writability' | 'readability' | 'disabledObjectPermissionActions'
  >,
): {
  writability: MetadataWritability;
  readability: MetadataReadability;
  disabledObjectPermissionActions: ObjectPermissionAction[] | null;
} => {
  const isApplicationWritable = isLegacyApplicationMetadataAccess(
    objectManifest.writability,
  );
  const isApplicationReadable = isLegacyApplicationMetadataAccess(
    objectManifest.readability,
  );

  const disabledObjectPermissionActions = [
    ...new Set([
      ...(objectManifest.disabledObjectPermissionActions ?? []),
      ...(isApplicationWritable
        ? APPLICATION_WRITABILITY_DISABLED_ACTIONS
        : []),
      ...(isApplicationReadable
        ? APPLICATION_READABILITY_DISABLED_ACTIONS
        : []),
    ]),
  ];

  return {
    writability: isApplicationWritable
      ? MetadataWritability.OPEN
      : (objectManifest.writability ?? MetadataWritability.OPEN),
    readability: isApplicationReadable
      ? MetadataReadability.OPEN
      : (objectManifest.readability ?? MetadataReadability.OPEN),
    disabledObjectPermissionActions: isNonEmptyArray(
      disabledObjectPermissionActions,
    )
      ? disabledObjectPermissionActions
      : (objectManifest.disabledObjectPermissionActions ?? null),
  };
};
