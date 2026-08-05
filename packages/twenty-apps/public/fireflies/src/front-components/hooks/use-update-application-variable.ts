import { useState } from 'react';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';

type UpdateApplicationVariableState = {
  updateApplicationVariable: (params: {
    variableKey: string;
    value: string;
  }) => Promise<boolean>;
  isUpdatingApplicationVariable: boolean;
};

export const useUpdateApplicationVariable = (
  applicationId: string,
): UpdateApplicationVariableState => {
  const [isUpdatingApplicationVariable, setIsUpdatingApplicationVariable] =
    useState(false);

  const updateApplicationVariable = async ({
    variableKey,
    value,
  }: {
    variableKey: string;
    value: string;
  }): Promise<boolean> => {
    setIsUpdatingApplicationVariable(true);

    try {
      const client = new MetadataApiClient();

      await client.mutation({
        updateOneApplicationVariable: {
          __args: { key: variableKey, value, applicationId },
        },
      });

      return true;
    } catch {
      return false;
    } finally {
      setIsUpdatingApplicationVariable(false);
    }
  };

  return { updateApplicationVariable, isUpdatingApplicationVariable };
};
