import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useAtomValue } from '@/ui/utilities/state/jotai/hooks/useAtomValue';
import { WorkspaceMemberTimeFormatEnum } from '~/generated-metadata/graphql';

export const useUserTimeFormat = () => {
  const currentWorkspaceMember = useAtomValue(currentWorkspaceMemberState);

  const userTimeFormat =
    currentWorkspaceMember?.timeFormat ?? WorkspaceMemberTimeFormatEnum.SYSTEM;

  return {
    userTimeFormat,
  };
};
