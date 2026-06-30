import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { WorkspaceMemberDateFormatEnum } from '~/generated-metadata/graphql';

export const useUserDateFormat = () => {
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);

  const userDateFormat =
    currentWorkspaceMember?.dateFormat ?? WorkspaceMemberDateFormatEnum.SYSTEM;

  return {
    userDateFormat,
  };
};
