import { useLingui } from '@lingui/react/macro';

import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { isDefined } from 'twenty-shared/utils';
import {
  useCreateDatabaseConfigVariableMutation,
  useDeleteDatabaseConfigVariableMutation,
  useUpdateDatabaseConfigVariableMutation,
} from '~/generated/graphql';

type ConfigVariableValue = string | number | boolean | string[] | null;

export const useConfigVariableActions = (variableName: string) => {
  const { t } = useLingui();
  const { enqueueSnackBar } = useSnackBar();

  const [updateDatabaseConfigVariable] =
    useUpdateDatabaseConfigVariableMutation();
  const [createDatabaseConfigVariable] =
    useCreateDatabaseConfigVariableMutation();
  const [deleteDatabaseConfigVariable] =
    useDeleteDatabaseConfigVariableMutation();

  const handleUpdateVariable = async (
    value: ConfigVariableValue,
    isFromDatabase: boolean,
  ) => {
    try {
      // If value is empty, null, or an empty array, treat as delete
      if (
        value === null ||
        value === '' ||
        (Array.isArray(value) && value.length === 0)
      ) {
        await handleDeleteVariable();
        return;
      }

      // Otherwise, update as normal
      if (isFromDatabase) {
        await updateDatabaseConfigVariable({
          variables: {
            key: variableName,
            value,
          },
          refetchQueries: ['GetDatabaseConfigVariable'],
        });
      } else {
        await createDatabaseConfigVariable({
          variables: {
            key: variableName,
            value,
          },
          refetchQueries: ['GetDatabaseConfigVariable'],
        });
      }

      enqueueSnackBar(t`Variable updated successfully`, {
        variant: SnackBarVariant.Success,
      });
    } catch (error) {
      enqueueSnackBar(t`Failed to update variable`, {
        variant: SnackBarVariant.Error,
      });
    }
  };

  const handleDeleteVariable = async (e?: React.MouseEvent) => {
    if (isDefined(e)) {
      e.preventDefault();
    }

    try {
      await deleteDatabaseConfigVariable({
        variables: {
          key: variableName,
        },
        refetchQueries: ['GetDatabaseConfigVariable'],
      });

      enqueueSnackBar(t`Database override removed successfully`, {
        variant: SnackBarVariant.Success,
      });
    } catch (error) {
      enqueueSnackBar(t`Failed to remove override`, {
        variant: SnackBarVariant.Error,
      });
    }
  };

  return {
    handleUpdateVariable,
    handleDeleteVariable,
  };
};
