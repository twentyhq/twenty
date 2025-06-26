import { ActionViewType } from '@/action-menu/actions/types/ActionViewType';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { ObjectPermissions } from '@/object-record/cache/types/ObjectPermissions';
import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { WorkflowWithCurrentVersion } from '@/workflow/types/Workflow';

export type ShouldBeRegisteredFunctionParams = {
  objectMetadataItem?: ObjectMetadataItem;
  objectPermissions: ObjectPermissions;
  recordFilters?: RecordFilter[];
  isShowPage?: boolean;
  isSoftDeleteFilterActive?: boolean;
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
};
