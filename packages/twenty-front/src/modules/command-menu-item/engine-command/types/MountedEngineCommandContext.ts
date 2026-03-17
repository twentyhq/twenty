import { type ContextStoreTargetedRecordsRule } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import {
  type Nullable,
  type RecordGqlOperationFilter,
} from 'twenty-shared/types';
import { type EngineComponentKey } from '~/generated-metadata/graphql';

export type MountedEngineCommandState = {
  engineComponentKey: EngineComponentKey;
  contextStoreInstanceId: string;
  objectMetadataItem: Nullable<ObjectMetadataItem>;
  currentViewId: Nullable<string>;
  recordIndexId: Nullable<string>;
  targetedRecordsRule: ContextStoreTargetedRecordsRule;
  selectedRecords: ObjectRecord[];
  graphqlFilter: Nullable<RecordGqlOperationFilter>;
};
