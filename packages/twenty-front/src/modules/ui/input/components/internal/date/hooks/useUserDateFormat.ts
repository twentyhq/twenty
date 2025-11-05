import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useRecoilValue } from 'recoil';
import { WorkspaceMemberDateFormatEnum } from '~/generated/graphql';

export const useUserDateFormat = () => {
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const userDateFormat =
    currentWorkspaceMember?.dateFormat ?? WorkspaceMemberDateFormatEnum.SYSTEM;

  return {
    userDateFormat,
  };
};
