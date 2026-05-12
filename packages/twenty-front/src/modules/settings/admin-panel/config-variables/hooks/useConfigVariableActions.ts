import { useClientConfig } from '@/client-config/hooks/useClientConfig';
import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';
import { GET_DATABASE_CONFIG_VARIABLE } from '@/settings/admin-panel/config-variables/graphql/queries/getDatabaseConfigVariable';
import { type ConfigVariableValue } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useMutation } from '@apollo/client/react';
import {
  CreateDatabaseConfigVariableDocument,
  DeleteDatabaseConfigVariableDocument,
  UpdateDatabaseConfigVariableDocument,
} from '~/generated-admin/graphql';

export const useConfigVariableActions = (variableName: string) => {
  const apolloAdminClient = useApolloAdminClient();
  const { refetch: refetchClientConfig } = useClientConfig();

  const [updateDatabaseConfigVariable] = useMutation(
    UpdateDatabaseConfigVariableDocument,
    { client: apolloAdminClient },
  );
  const [createDatabaseConfigVariable] = useMutation(
    CreateDatabaseConfigVariableDocument,
    { client: apolloAdminClient },
  );
  const [deleteDatabaseConfigVariable] = useMutation(
    DeleteDatabaseConfigVariableDocument,
    { client: apolloAdminClient },
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
