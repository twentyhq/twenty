import { type ContextStoreTargetedRecordsRule } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import {
  type Nullable,
  type RecordGqlOperationFilter,
} from 'twenty-shared/types';
import { type EngineComponentKey } from '~/generated-metadata/graphql';

export type MountedEngineCommandContext = {
  engineComponentKey: EngineComponentKey;
  contextStoreInstanceId: string;
  objectMetadataItem: Nullable<ObjectMetadataItem>;
  recordId: Nullable<string>;
  currentViewId: Nullable<string>;
  recordIndexId: Nullable<string>;
  targetedRecordsRule: ContextStoreTargetedRecordsRule;
  selectedRecordIds: string[];
  selectedRecords: ObjectRecord[];
  graphqlFilter: Nullable<RecordGqlOperationFilter>;
};
