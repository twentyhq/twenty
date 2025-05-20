import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { GET_ALL_ISSUERS_BY_WORKSPACE } from '@/settings/integrations/focus-nfe/graphql/get-all-issuers-by-workspace.gql'; // To refetch list
import { CREATE_ISSUER_MUTATION } from '@/settings/integrations/focus-nfe/graphql/mutation/createIssuer.mutation.gql';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation } from '@apollo/client';
import { useRecoilValue } from 'recoil';
import { IssuerFormValues } from '~/types/Issuer'; // Using IssuerFormValues for input

// The backend's CreateIssuerInput will be slightly different from IssuerFormValues
// We need to map IssuerFormValues to the expected CreateIssuerInput structure.
// For now, let's assume they are compatible enough or the hook will do the mapping.
interface CreateIssuerHookResponse {
  createIssuer: (input: IssuerFormValues) => Promise<void>;
  data: any; // Type this based on actual mutation response
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
      // Refetch the list of issuers after creation
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

    // Map formInput (IssuerFormValues) to the backend's CreateIssuerInput structure
    // The backend expects all fields defined in its CreateIssuerInput DTO.
    // IssuerFormValues might have empty strings for optional fields, backend might expect undefined or null.
    // For now, direct spread, but this might need adjustment.
    const createInput = {
      ...formInput,
      cpf: formInput.cpf || null, // Ensure empty strings become null if backend expects it
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
