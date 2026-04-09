import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { WorkspaceMemberTimeFormatEnum } from '~/generated-metadata/graphql';

export const useUserTimeFormat = () => {
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);

  const userTimeFormat =
    currentWorkspaceMember?.timeFormat ?? WorkspaceMemberTimeFormatEnum.SYSTEM;

  return {
    userTimeFormat,
  };
};
