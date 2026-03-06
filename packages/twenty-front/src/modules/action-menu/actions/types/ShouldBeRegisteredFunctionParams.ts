import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { type WorkflowWithCurrentVersion } from '@/workflow/types/Workflow';
import {
  type ActionViewType,
  type ObjectPermissions,
} from 'twenty-shared/types';
import { type FeatureFlagKey } from '~/generated-metadata/graphql';

export type ShouldBeRegisteredFunctionParams = {
  objectMetadataItem?: ObjectMetadataItem;
  objectPermissions: ObjectPermissions;
  recordFilters?: RecordFilter[];
  isShowPage?: boolean;
  hasAnySoftDeleteFilterOnView?: boolean;
  isInSidePanel?: boolean;
  isFavorite?: boolean;
  isRemote?: boolean;
  isNoteOrTask?: boolean;
  isSelectAll?: boolean;
  loadedRecords?: ObjectRecord[];
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
  isFeatureFlagEnabled: (featureFlagKey: FeatureFlagKey) => boolean;
};
