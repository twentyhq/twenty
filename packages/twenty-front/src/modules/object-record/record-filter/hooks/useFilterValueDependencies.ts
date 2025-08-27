import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { type RecordFilterValueDependencies } from '@/object-record/record-filter/types/RecordFilterValueDependencies';
import { useRecoilValue } from 'recoil';

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
