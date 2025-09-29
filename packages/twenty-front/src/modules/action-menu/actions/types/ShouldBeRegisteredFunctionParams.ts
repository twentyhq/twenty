import { type ActionViewType } from '@/action-menu/actions/types/ActionViewType';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { type WorkflowWithCurrentVersion } from '@/workflow/types/Workflow';
import { type ObjectPermissions } from 'twenty-shared/types';

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
  selectedRecord?: ObjectRecord;
  numberOfSelectedRecords?: number;
  workflowWithCurrentVersion?: WorkflowWithCurrentVersion;
  viewType?: ActionViewType;
  getTargetObjectReadPermission: (
    objectMetadataItemNameSingular: string,
  ) => boolean;
  getTargetObjectWritePermission: (
    objectMetadataItemNameSingular: string,
  ) => boolean;
  forceRegisteredActionsByKey: Record<string, boolean | undefined>;
};
