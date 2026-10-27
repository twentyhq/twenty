import {
  type ObjectManifest,
  type ObjectPermissionAction,
} from 'twenty-shared/application';
import { MetadataWritability } from 'twenty-shared/types';

const APPLICATION_WRITABILITY_DISABLED_ACTIONS: ObjectPermissionAction[] = [
  'canUpdateObjectRecords',
  'canSoftDeleteObjectRecords',
  'canDestroyObjectRecords',
];

export const resolveObjectManifestWritability = ({
  writability = MetadataWritability.OPEN,
  disabledObjectPermissionActions,
}: Pick<ObjectManifest, 'writability' | 'disabledObjectPermissionActions'>): {
  writability: MetadataWritability;
  disabledObjectPermissionActions: ObjectPermissionAction[] | null;
} => {
  if (writability !== MetadataWritability.APPLICATION) {
    return {
      writability,
      disabledObjectPermissionActions: disabledObjectPermissionActions ?? null,
    };
  }

  return {
    writability: MetadataWritability.OPEN,
    disabledObjectPermissionActions: [
      ...new Set([
        ...(disabledObjectPermissionActions ?? []),
        ...APPLICATION_WRITABILITY_DISABLED_ACTIONS,
      ]),
    ],
  };
};
