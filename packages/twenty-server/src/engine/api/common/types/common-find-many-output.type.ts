import { type ObjectRecord } from 'twenty-shared/types';

import { type CommonPageInfo } from 'src/engine/api/common/types/common-page-info.type';
import { type CommonSelectedFieldsResult } from 'src/engine/api/common/types/common-selected-fields-result.type';

export type CommonFindManyOutput = {
  records: ObjectRecord[];
  aggregatedValues: Record<string, number>;
  totalCount: number;
  pageInfo: CommonPageInfo;
  selectedFieldsResult: CommonSelectedFieldsResult;
};
