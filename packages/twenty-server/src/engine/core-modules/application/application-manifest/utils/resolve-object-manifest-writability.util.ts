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
} =>
  writability === MetadataWritability.APPLICATION
    ? {
        writability: MetadataWritability.OPEN,
        disabledObjectPermissionActions: [
          ...new Set([
            ...(disabledObjectPermissionActions ?? []),
            ...APPLICATION_WRITABILITY_DISABLED_ACTIONS,
          ]),
        ],
      }
    : {
        writability,
        disabledObjectPermissionActions:
          disabledObjectPermissionActions ?? null,
      };
