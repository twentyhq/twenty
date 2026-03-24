import { type ContextStoreTargetedRecordsRule } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import {
  type Nullable,
  type RecordGqlOperationFilter,
} from 'twenty-shared/types';
import { type EngineComponentKey } from '~/generated-metadata/graphql';

export type MountedCommandBaseState = {
  engineComponentKey: EngineComponentKey;
  contextStoreInstanceId: string;
  objectMetadataItem: Nullable<EnrichedObjectMetadataItem>;
  currentViewId: Nullable<string>;
  recordIndexId: Nullable<string>;
  targetedRecordsRule: ContextStoreTargetedRecordsRule;
  selectedRecords: ObjectRecord[];
  graphqlFilter: Nullable<RecordGqlOperationFilter>;
};

export type MountedHeadlessFrontComponentCommandState = MountedCommandBaseState & {
  frontComponentId: string;
};

export type MountedTriggerWorkflowVersionCommandState = MountedCommandBaseState & {
  workflowId: string;
  workflowVersionId: string;
  payloads: Record<string, any>[];
};

export type MountedCommandState =
  | MountedCommandBaseState
  | MountedHeadlessFrontComponentCommandState
  | MountedTriggerWorkflowVersionCommandState;
