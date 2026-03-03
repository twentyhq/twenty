import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { type ObjectPermissions } from 'twenty-shared/types';

export type CommandMenuContext = {
  isShowPage: boolean;
  isInRightDrawer: boolean;
  isFavorite: boolean;
  isRemote: boolean;
  isNoteOrTask: boolean;
  isSelectAll: boolean;
  hasAnySoftDeleteFilterOnView: boolean;
  numberOfSelectedRecords: number;
  objectPermissions: ObjectPermissions & { objectMetadataId: string };
  selectedRecord: ObjectRecord | undefined;
  featureFlags: Record<string, boolean>;
  targetObjectReadPermissions: Record<string, boolean>;
  targetObjectWritePermissions: Record<string, boolean>;
};
