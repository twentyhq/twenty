import {
  type FilterableAndTSVectorFieldType,
  type RecordFilterOperand,
} from 'twenty-shared/types';
import { getFilterOperandsForFilterableFieldType } from 'twenty-shared/utils';

export const getRecordFilterOperands = ({
  filterType,
  subFieldName,
}: {
  filterType: FilterableAndTSVectorFieldType;
  subFieldName?: string | null | undefined;
}): readonly RecordFilterOperand[] => {
  return getFilterOperandsForFilterableFieldType({
    filterType,
    subFieldName,
  });
};
