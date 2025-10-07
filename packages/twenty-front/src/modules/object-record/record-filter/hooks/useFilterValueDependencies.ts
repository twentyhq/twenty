import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useRecoilValue } from 'recoil';
import { type RecordFilterValueDependencies } from 'twenty-shared/types';

export const useFilterValueDependencies = (): {
  filterValueDependencies: RecordFilterValueDependencies;
} => {
  const { id: currentWorkspaceMemberId } =
    useRecoilValue(currentWorkspaceMemberState) ?? {};

  return {
    filterValueDependencies: {
      currentWorkspaceMemberId,
    },
  };
};
