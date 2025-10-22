import { type CommonGroupByOutputItem } from 'src/engine/api/common/types/common-group-by-output-item.type';
import { type CommonQueryResult } from 'src/engine/api/common/types/common-query-result.type';

export const isCommonQueryResultACommonGroupByOutputItemArray = (
  result: CommonQueryResult,
): result is CommonGroupByOutputItem[] => {
  return (
    Array.isArray(result) &&
    result.every((item) => 'groupByDimensionValues' in item)
  );
};
