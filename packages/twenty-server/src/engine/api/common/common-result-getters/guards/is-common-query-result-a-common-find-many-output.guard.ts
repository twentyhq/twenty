import { type CommonFindManyOutput } from 'src/engine/api/common/types/common-find-many-output.type';
import { type CommonQueryResult } from 'src/engine/api/common/types/common-query-result.type';

export const isCommonQueryResultACommonFindManyOutput = (
  result: CommonQueryResult,
): result is CommonFindManyOutput => {
  return (
    'records' in result &&
    'aggregatedValues' in result &&
    'totalCount' in result &&
    'pageInfo' in result &&
    'selectedFieldsResult' in result
  );
};
