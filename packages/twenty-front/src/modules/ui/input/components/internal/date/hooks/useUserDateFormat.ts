import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { WorkspaceMemberDateFormatEnum } from '~/generated-metadata/graphql';

export const useUserDateFormat = () => {
  const currentWorkspaceMember = useRecoilValueV2(currentWorkspaceMemberState);

  const userDateFormat =
    currentWorkspaceMember?.dateFormat ?? WorkspaceMemberDateFormatEnum.SYSTEM;

  return {
    userDateFormat,
  };
};
