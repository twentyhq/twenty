import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { CREATE_ISSUER_MUTATION } from '@/settings/integrations/focus-nfe/graphql/mutation/createIssuer.mutation.gql';
import { GET_ALL_ISSUERS_BY_WORKSPACE } from '@/settings/integrations/focus-nfe/graphql/query/getAllIssuersByWorkspace'; // To refetch list
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation } from '@apollo/client';
import { useRecoilValue } from 'recoil';
import { IssuerFormValues } from '~/types/Issuer'; // Using IssuerFormValues for input

interface CreateIssuerHookResponse {
  createIssuer: (input: IssuerFormValues) => Promise<void>;
  data: any;
  loading: boolean;
  error: Error | undefined;
}

export const useCreateIssuer = (): CreateIssuerHookResponse => {
  const { enqueueSnackBar } = useSnackBar();
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const [createIssuerMutation, { data, loading, error }] = useMutation(
    CREATE_ISSUER_MUTATION,
    {
      onError: (error) => {
        enqueueSnackBar(error.message, {
          variant: SnackBarVariant.Error,
        });
      },
      onCompleted: () => {
        enqueueSnackBar('Issuer created successfully!', {
          variant: SnackBarVariant.Success,
        });
      },
      refetchQueries: [{ query: GET_ALL_ISSUERS_BY_WORKSPACE }],
    },
  );

  const createIssuer = async (formInput: IssuerFormValues) => {
    if (!currentWorkspace?.id) {
      enqueueSnackBar('No active workspace selected.', {
        variant: SnackBarVariant.Error,
      });
      return;
    }

    const createInput = {
      ...formInput,
      cpf: formInput.cpf || null,
      ie: formInput.ie || null,
      cnaeCode: formInput.cnaeCode || null,
      workspaceId: currentWorkspace.id,
    };

    await createIssuerMutation({
      variables: {
        createInput,
      },
    });
  };

  return {
    createIssuer,
    data,
    loading,
    error,
  };
};
