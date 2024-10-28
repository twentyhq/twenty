import { useGetAvailableAuthMethodsByWorkspaceSubdomainQuery } from '~/generated/graphql';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { authProvidersState } from '@/client-config/states/authProvidersState';
import { useSetRecoilState } from 'recoil';

export const useWorkspaceUnauthenticatedData = () => {
  const { enqueueSnackBar } = useSnackBar();

  const setAuthProviders = useSetRecoilState(authProvidersState);

  const { loading } = useGetAvailableAuthMethodsByWorkspaceSubdomainQuery({
    onCompleted: (data) => {
      setAuthProviders(
        data?.getAvailableAuthMethodsByWorkspaceSubdomain?.authProviders,
      );
    },
    onError: (error) => {
      enqueueSnackBar(error.message, {
        variant: SnackBarVariant.Error,
      });
    },
  });

  return {
    loading,
  };
};
