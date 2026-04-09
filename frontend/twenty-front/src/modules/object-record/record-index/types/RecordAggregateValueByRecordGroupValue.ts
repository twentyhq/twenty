import { type Nullable } from 'twenty-shared/types';

export type RecordAggregateValueByRecordGroupValue = {
  recordGroupValue: string;
  recordAggregateValue: Nullable<string | number>;
};
