import { UPDATE_ISSUER_MUTATION } from '@/settings/integrations/focus-nfe/graphql/mutation/updateIssuer';
import { GET_ALL_ISSUERS_BY_WORKSPACE } from '@/settings/integrations/focus-nfe/graphql/query/getAllIssuersByWorkspace';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation } from '@apollo/client';
import { type Issuer, type UpdateIssuerData } from '~/types/Issuer'; // Assuming Issuer type is needed for return

export const useUpdateIssuer = () => {
  const { enqueueSnackBar } = useSnackBar();

  const [updateIssuerMutation, { loading }] = useMutation<
    { updateIssuer: Issuer },
    { id: string; updateInput: UpdateIssuerData }
  >(UPDATE_ISSUER_MUTATION, {
    refetchQueries: [{ query: GET_ALL_ISSUERS_BY_WORKSPACE }],
  });

  const updateIssuer = async (id: string, data: UpdateIssuerData) => {
    try {
      const result = await updateIssuerMutation({
        variables: { id, updateInput: data },
      });
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
      throw error;
    }
  };

  return { updateIssuer, loading };
};
