import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { WorkspaceMemberTimeFormatEnum } from '~/generated-metadata/graphql';

export const useUserTimeFormat = () => {
  const currentWorkspaceMember = useRecoilValueV2(currentWorkspaceMemberState);

  const userTimeFormat =
    currentWorkspaceMember?.timeFormat ?? WorkspaceMemberTimeFormatEnum.SYSTEM;

  return {
    userTimeFormat,
  };
};
