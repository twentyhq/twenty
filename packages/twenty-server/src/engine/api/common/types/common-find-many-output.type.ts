import { type ObjectRecord } from 'twenty-shared/types';

import { type CommonPageInfo } from 'src/engine/api/common/types/common-page-info.type';
import { type CommonSelectedFieldsResult } from 'src/engine/api/common/types/common-selected-fields-result.type';
import { type OrderByValuesByRecordId } from 'src/engine/api/utils/build-order-by-values-by-record-id.util';

export type CommonFindManyOutput = {
  records: ObjectRecord[];
  aggregatedValues: Record<string, number> | undefined;
  totalCount: number | undefined;
  pageInfo: CommonPageInfo;
  // Cursor values read from the scan's raw rows, so edge cursors carry the
  // exact SQL sort values whatever the selection presents
  orderByValuesByRecordId: OrderByValuesByRecordId;
  selectedFieldsResult: CommonSelectedFieldsResult;
};
