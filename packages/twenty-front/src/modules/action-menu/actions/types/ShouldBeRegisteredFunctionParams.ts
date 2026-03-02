import {
  type ActionViewType,
  type ObjectPermissions,
} from 'twenty-shared/types';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { type WorkflowWithCurrentVersion } from '@/workflow/types/Workflow';

export type ShouldBeRegisteredFunctionParams = {
  objectMetadataItem?: ObjectMetadataItem;
  objectPermissions: ObjectPermissions;
  recordFilters?: RecordFilter[];
  isShowPage?: boolean;
  hasAnySoftDeleteFilterOnView?: boolean;
  isInRightDrawer?: boolean;
  isFavorite?: boolean;
  isRemote?: boolean;
  isNoteOrTask?: boolean;
  isSelectAll?: boolean;
  loadedRecords?: ObjectRecord[];
  selectedRecord?: ObjectRecord;
  numberOfSelectedRecords?: number;
  workflowWithCurrentVersion?: WorkflowWithCurrentVersion;
  viewType?: ActionViewType;
  targetObjectReadPermissions: Record<string, boolean>;
  targetObjectWritePermissions: Record<string, boolean>;
  featureFlags: Record<string, boolean>;
};
