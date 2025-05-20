import { GET_ALL_ISSUERS_BY_WORKSPACE } from '@/settings/integrations/focus-nfe/graphql/get-all-issuers-by-workspace.gql';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation } from '@apollo/client';
import { UPDATE_ISSUER_MUTATION } from '~/graphql/mutation/updateIssuer.mutation.gql';
import { type Issuer, type UpdateIssuerInput } from '~/types/Issuer'; // Assuming Issuer type is needed for return

export const useUpdateIssuer = () => {
  const { enqueueSnackBar } = useSnackBar();

  const [updateIssuerMutation, { loading }] = useMutation<
    { updateIssuer: Issuer },
    { input: UpdateIssuerInput }
  >(UPDATE_ISSUER_MUTATION, {
    refetchQueries: [{ query: GET_ALL_ISSUERS_BY_WORKSPACE }],
    // Optimistic response can be added here if desired
  });

  const updateIssuer = async (input: UpdateIssuerInput) => {
    try {
      const result = await updateIssuerMutation({ variables: { input } });
      enqueueSnackBar('Issuer updated successfully!', {
        variant: SnackBarVariant.Success,
      });
      return result.data?.updateIssuer;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error updating issuer:', error);
      enqueueSnackBar((error as Error).message || 'Failed to update issuer.', {
        variant: SnackBarVariant.Error,
      });
      throw error; // Re-throw to allow caller to handle if needed
    }
  };

  return { updateIssuer, loading };
};
