import { useLingui } from '@lingui/react/macro';

import { useClientConfig } from '@/client-config/hooks/useClientConfig';
import { GET_DATABASE_CONFIG_VARIABLE } from '@/settings/admin-panel/config-variables/graphql/queries/getDatabaseConfigVariable';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { type ConfigVariableValue } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  useCreateDatabaseConfigVariableMutation,
  useDeleteDatabaseConfigVariableMutation,
  useUpdateDatabaseConfigVariableMutation,
} from '~/generated-metadata/graphql';

export const useConfigVariableActions = (variableName: string) => {
  const { t } = useLingui();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const { refetch: refetchClientConfig } = useClientConfig();

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
          ],
        });
      }

      await refetchClientConfig();

      enqueueSuccessSnackBar({
        message: t`Variable updated successfully.`,
      });
    } catch {
      enqueueErrorSnackBar({
        message: t`Failed to update variable`,
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
        ],
      });

      await refetchClientConfig();

      enqueueSuccessSnackBar({
        message: t`Variable deleted successfully.`,
      });
    } catch {
      enqueueErrorSnackBar({
        message: t`Failed to remove override`,
      });
    }
  };

  return {
    handleUpdateVariable,
    handleDeleteVariable,
  };
};
