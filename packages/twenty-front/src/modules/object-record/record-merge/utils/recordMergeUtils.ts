import { msg } from '@lingui/core/macro';
import { MUTATION_MAX_MERGE_RECORDS } from 'twenty-shared/constants';
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

type FixedLengthArray<T, L extends number> = T[] & { length: L };

export const getPositionWordLabel = (index: number): string => {
  const labels: FixedLengthArray<
    ReturnType<typeof msg>,
    typeof MUTATION_MAX_MERGE_RECORDS
  > = [
    msg`First`,
    msg`Second`,
    msg`Third`,
    msg`Fourth`,
    msg`Fifth`,
    msg`Sixth`,
    msg`Seventh`,
    msg`Eighth`,
    msg`Ninth`,
  ];
  return labels[index] ? (labels[index].message as string) : '';
};

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
