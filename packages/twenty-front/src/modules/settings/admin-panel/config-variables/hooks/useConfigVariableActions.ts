import { useClientConfig } from '@/client-config/hooks/useClientConfig';
import { GET_DATABASE_CONFIG_VARIABLE } from '@/settings/admin-panel/config-variables/graphql/queries/getDatabaseConfigVariable';
import { type ConfigVariableValue } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useMutation } from '@apollo/client/react';
import {
  CreateDatabaseConfigVariableDocument,
  DeleteDatabaseConfigVariableDocument,
  UpdateDatabaseConfigVariableDocument,
} from '~/generated-metadata/graphql';

export const useConfigVariableActions = (variableName: string) => {
  const { refetch: refetchClientConfig } = useClientConfig();

  const [updateDatabaseConfigVariable] = useMutation(
    UpdateDatabaseConfigVariableDocument,
  );
  const [createDatabaseConfigVariable] = useMutation(
    CreateDatabaseConfigVariableDocument,
  );
  const [deleteDatabaseConfigVariable] = useMutation(
    DeleteDatabaseConfigVariableDocument,
  );

  const handleUpdateVariable = async (
    value: ConfigVariableValue,
    isFromDatabase: boolean,
  ) => {
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
  };

  const handleDeleteVariable = async (e?: React.MouseEvent<HTMLElement>) => {
    if (isDefined(e)) {
      e.preventDefault();
    }

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
  };

  return {
    handleUpdateVariable,
    handleDeleteVariable,
  };
};
