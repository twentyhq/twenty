import { type MUTATION_MAX_MERGE_RECORDS } from 'twenty-shared/constants';
import {
  IconSquareNumber1,
  IconSquareNumber2,
  IconSquareNumber3,
  IconSquareNumber4,
  IconSquareNumber5,
  IconSquareNumber6,
  IconSquareNumber7,
  IconSquareNumber8,
  IconSquareNumber9,
} from 'twenty-ui/display';
import { type FixedLengthArray } from '@/object-record/record-merge/types/FixedLengthArray';

export const getPositionNumberIcon = (index: number) => {
  const iconMapping: FixedLengthArray<
    typeof IconSquareNumber1,
    typeof MUTATION_MAX_MERGE_RECORDS
  > = [
    IconSquareNumber1,
    IconSquareNumber2,
    IconSquareNumber3,
    IconSquareNumber4,
    IconSquareNumber5,
    IconSquareNumber6,
    IconSquareNumber7,
    IconSquareNumber8,
    IconSquareNumber9,
  ];

  return iconMapping[index] || IconSquareNumber1;
};
