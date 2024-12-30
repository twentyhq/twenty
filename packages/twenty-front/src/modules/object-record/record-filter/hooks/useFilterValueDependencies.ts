import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { FilterValueDependencies } from '@/object-record/record-filter/types/FilterValueDependencies';
import { useRecoilValue } from 'recoil';

export const useFilterValueDependencies = (): {
  filterValueDependencies: FilterValueDependencies;
} => {
  const { id: currentWorkspaceMemberId } =
    useRecoilValue(currentWorkspaceMemberState) ?? {};

  return {
    filterValueDependencies: {
      currentWorkspaceMemberId,
    },
  };
};
