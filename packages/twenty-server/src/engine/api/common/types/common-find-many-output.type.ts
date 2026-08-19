import { type ObjectRecord } from 'twenty-shared/types';

import { type CommonPageInfo } from 'src/engine/api/common/types/common-page-info.type';
import { type CommonSelectedFieldsResult } from 'src/engine/api/common/types/common-selected-fields-result.type';
import { type RelationOrderValuesByRecordId } from 'src/engine/api/utils/build-relation-order-values-by-record-id.util';

export type CommonFindManyOutput = {
  records: ObjectRecord[];
  aggregatedValues: Record<string, number> | undefined;
  totalCount: number | undefined;
  pageInfo: CommonPageInfo;
  // Lets edge cursors carry relation orderBy values without requiring the
  // ordered relation in the selection
  relationOrderValuesByRecordId: RelationOrderValuesByRecordId;
  selectedFieldsResult: CommonSelectedFieldsResult;
};
