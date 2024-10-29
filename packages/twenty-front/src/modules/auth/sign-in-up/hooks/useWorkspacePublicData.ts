import { useGetPublicWorkspaceDataBySubdomainQuery } from '~/generated/graphql';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { authProvidersState } from '@/client-config/states/authProvidersState';
import { useSetRecoilState } from 'recoil';
import { workspacePublicDataState } from '@/auth/states/workspacePublicDataState';

export const useWorkspacePublicData = () => {
  const { enqueueSnackBar } = useSnackBar();

  const setAuthProviders = useSetRecoilState(authProvidersState);
  const setWorkspacePublicDataState = useSetRecoilState(
    workspacePublicDataState,
  );

  const { loading } = useGetPublicWorkspaceDataBySubdomainQuery({
    onCompleted: (data) => {
      const publicWorkspaceDataBySubdomain =
        data.getPublicWorkspaceDataBySubdomain;
      setAuthProviders(publicWorkspaceDataBySubdomain.authProviders);
      setWorkspacePublicDataState(publicWorkspaceDataBySubdomain);
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
