import { type ObjectRecord } from 'twenty-shared/types';

import { type CommonAggregatedValues } from 'src/engine/api/common/types/common-aggregated-values.type';
import { type CommonPageInfo } from 'src/engine/api/common/types/common-page-info.type';
import { type CommonSelectedFieldsResult } from 'src/engine/api/common/types/common-selected-fields-result.type';
import { type OrderByValuesByRecordId } from 'src/engine/api/utils/build-order-by-values-by-record-id.util';

export type CommonFindManyOutput = {
  records: ObjectRecord[];
  aggregatedValues: CommonAggregatedValues | undefined;
  totalCount: number | undefined;
  pageInfo: CommonPageInfo;
  // Read from raw rows, so cursors carry the exact SQL sort values whatever the selection presents
  orderByValuesByRecordId: OrderByValuesByRecordId;
  selectedFieldsResult: CommonSelectedFieldsResult;
};
