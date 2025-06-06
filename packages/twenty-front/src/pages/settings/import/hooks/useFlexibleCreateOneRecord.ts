import { gql, useApolloClient } from '@apollo/client';
import { useCallback } from 'react';

export const useFlexibleCreateOneRecord = () => {
  const apolloClient = useApolloClient();

  const createOneRecord = useCallback(
    async (objectNameSingular: string, recordInput: Record<string, any>) => {
      if (!objectNameSingular) {
        throw new Error('Object name is required for record creation');
      }

      // Convert object name to PascalCase for mutation name
      const pascalCaseObjectName = objectNameSingular
        .split(/[-_\s]+/)
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        )
        .join('');

      // Create dynamic mutation
      const mutationName = `create${pascalCaseObjectName}`;
      const inputTypeName = `${pascalCaseObjectName.charAt(0).toUpperCase()}${pascalCaseObjectName.slice(1)}CreateInput`;

      const CREATE_DYNAMIC_RECORD_MUTATION = gql`
        mutation ${mutationName}($data: ${inputTypeName}!) {
          ${mutationName}(data: $data) {
            id
          }
        }
      `;

      const maxRetries = 15;
      let retryCount = 0;

      const executeWithRetry = async (): Promise<any> => {
        try {
          return await apolloClient.mutate({
            mutation: CREATE_DYNAMIC_RECORD_MUTATION,
            variables: {
              data: recordInput,
            },
          });
        } catch (error: any) {
          if (
            Boolean(error.message?.includes('workspace has been updated')) &&
            retryCount < maxRetries
          ) {
            retryCount++;
            const delay = Math.min(3000 * Math.pow(1.3, retryCount), 20000);
            //todo
            await new Promise((resolve) => setTimeout(resolve, delay));
            return executeWithRetry();
          }
          throw error;
        }
      };

      return executeWithRetry();
    },
    [apolloClient],
  );

  return { createOneRecord };
};
