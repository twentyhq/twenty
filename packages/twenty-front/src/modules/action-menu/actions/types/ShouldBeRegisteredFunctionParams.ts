import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { WorkflowWithCurrentVersion } from '@/workflow/types/Workflow';

export type ShouldBeRegisteredFunctionParams = {
  objectMetadataItem?: ObjectMetadataItem;
  hasObjectReadOnlyPermission?: boolean;
  isWorkflowsEnabled?: boolean;
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
};
