import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useRecoilValue } from 'recoil';
import { WorkspaceMemberTimeFormatEnum } from '~/generated-metadata/graphql';

export const useUserTimeFormat = () => {
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const userTimeFormat =
    currentWorkspaceMember?.timeFormat ?? WorkspaceMemberTimeFormatEnum.SYSTEM;

  return {
    userTimeFormat,
  };
};
