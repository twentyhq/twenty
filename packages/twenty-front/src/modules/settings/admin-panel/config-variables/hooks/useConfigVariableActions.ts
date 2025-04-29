import { useLingui } from '@lingui/react/macro';

import { GET_CLIENT_CONFIG } from '@/client-config/graphql/queries/getClientConfig';
import { GET_DATABASE_CONFIG_VARIABLE } from '@/settings/admin-panel/config-variables/graphql/queries/getDatabaseConfigVariable';
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
      if (
        value === null ||
        (typeof value === 'string' && value === '') ||
        (Array.isArray(value) && value.length === 0)
      ) {
        await handleDeleteVariable();
        return;
      }

      if (isFromDatabase) {
        await updateDatabaseConfigVariable({
          variables: {
            key: variableName,
            value,
          },
          refetchQueries: [
            {
              query: GET_DATABASE_CONFIG_VARIABLE,
              variables: { key: variableName },
            },
            {
              query: GET_CLIENT_CONFIG,
            },
          ],
        });
      } else {
        await createDatabaseConfigVariable({
          variables: {
            key: variableName,
            value,
          },
          refetchQueries: [
            {
              query: GET_DATABASE_CONFIG_VARIABLE,
              variables: { key: variableName },
            },
            {
              query: GET_CLIENT_CONFIG,
            },
          ],
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

  const handleDeleteVariable = async (e?: React.MouseEvent<HTMLElement>) => {
    if (isDefined(e)) {
      e.preventDefault();
    }

    try {
      await deleteDatabaseConfigVariable({
        variables: {
          key: variableName,
        },
        refetchQueries: [
          {
            query: GET_DATABASE_CONFIG_VARIABLE,
            variables: { key: variableName },
          },
          {
            query: GET_CLIENT_CONFIG,
          },
        ],
      });
    } catch (error) {
      enqueueSnackBar(t`Failed to remove  override`, {
        variant: SnackBarVariant.Error,
      });
    }
  };

  return {
    handleUpdateVariable,
    handleDeleteVariable,
  };
};
