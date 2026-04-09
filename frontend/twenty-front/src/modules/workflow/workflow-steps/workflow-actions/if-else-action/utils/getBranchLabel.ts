import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { type StepIfElseBranch } from 'twenty-shared/workflow';
import { isDefined } from 'twenty-shared/utils';

export const getBranchLabel = ({
  branchIndex,
  totalBranches,
  branch,
}: {
  branchIndex: number;
  totalBranches: number;
  branch?: StepIfElseBranch;
}): MessageDescriptor => {
  if (branchIndex === 0) {
    return msg`if`;
  }

  const isElseBranch =
    branchIndex === totalBranches - 1 &&
    (!isDefined(branch) || !isDefined(branch.filterGroupId));

  if (isElseBranch) {
    return msg`else`;
  }

  return msg`else if`;
};
