import { ActionViewType } from '@/action-menu/actions/types/ActionViewType';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { WorkflowWithCurrentVersion } from '@/workflow/types/Workflow';
import { ObjectPermission } from '~/generated/graphql';

export type ShouldBeRegisteredFunctionParams = {
  objectMetadataItem?: ObjectMetadataItem;
  objectPermissions: ObjectPermission;
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
  getTargetObjectWritePermission: (
    objectMetadataItemNameSingular: string,
  ) => boolean;
};
