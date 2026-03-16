import { type ContextStoreTargetedRecordsRule } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import {
  type Nullable,
  type RecordGqlOperationFilter,
} from 'twenty-shared/types';

export type EngineCommandExecutionContext = {
  commandId: string;
  userId: Nullable<string>;
  recordId: Nullable<string>;

  objectMetadataItem: Nullable<ObjectMetadataItem>;
  contextStoreInstanceId: string;

  currentViewId: Nullable<string>;
  recordIndexId: Nullable<string>;

  targetedRecordsRule: ContextStoreTargetedRecordsRule;
  selectedRecordIds: string[];
  selectedRecords: ObjectRecord[];

  filters: RecordFilter[];
  filterGroups: RecordFilterGroup[];
  anyFieldFilterValue: string;
  graphqlFilter: Nullable<RecordGqlOperationFilter>;
};
