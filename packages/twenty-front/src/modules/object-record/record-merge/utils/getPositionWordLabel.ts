import { msg } from '@lingui/core/macro';
import { MUTATION_MAX_MERGE_RECORDS } from 'twenty-shared/constants';
import { FixedLengthArray } from '../types/FixedLengthArray';

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
