import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useAtomValue } from '@/ui/utilities/state/jotai/hooks/useAtomValue';
import { WorkspaceMemberDateFormatEnum } from '~/generated-metadata/graphql';

export const useUserDateFormat = () => {
  const currentWorkspaceMember = useAtomValue(currentWorkspaceMemberState);

  const userDateFormat =
    currentWorkspaceMember?.dateFormat ?? WorkspaceMemberDateFormatEnum.SYSTEM;

  return {
    userDateFormat,
  };
};
