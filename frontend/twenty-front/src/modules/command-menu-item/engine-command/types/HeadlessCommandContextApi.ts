import { type ContextStoreTargetedRecordsRule } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import {
  type Nullable,
  type RecordGqlOperationFilter,
} from 'twenty-shared/types';
import { type EngineComponentKey } from '~/generated-metadata/graphql';

export type HeadlessEngineCommandContextApi = {
  engineComponentKey: EngineComponentKey;
  contextStoreInstanceId: string;
  objectMetadataItem: Nullable<EnrichedObjectMetadataItem>;
  currentViewId: Nullable<string>;
  recordIndexId: Nullable<string>;
  targetedRecordsRule: ContextStoreTargetedRecordsRule;
  selectedRecords: ObjectRecord[];
  graphqlFilter: Nullable<RecordGqlOperationFilter>;
};

export type HeadlessFrontComponentCommandContextApi =
  HeadlessEngineCommandContextApi & {
    frontComponentId: string;
  };

export type HeadlessTriggerWorkflowVersionCommandContextApi =
  HeadlessEngineCommandContextApi & {
    workflowId: string;
    workflowVersionId: string;
    payloads: Record<string, any>[];
  };

export type HeadlessCommandContextApi =
  | HeadlessEngineCommandContextApi
  | HeadlessFrontComponentCommandContextApi
  | HeadlessTriggerWorkflowVersionCommandContextApi;
