import { MetadataApiClient } from 'twenty-client-sdk/metadata';

type UpdateApplicationVariableParams = {
  variableKey: string;
  value: string;
};

type UpdateApplicationVariableState = {
  updateApplicationVariable: (
    params: UpdateApplicationVariableParams,
  ) => Promise<boolean>;
};

export const useUpdateApplicationVariable = (
  applicationId: string,
): UpdateApplicationVariableState => {
  const updateApplicationVariable = async ({
    variableKey,
    value,
  }: UpdateApplicationVariableParams): Promise<boolean> => {
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
    }
  };

  return { updateApplicationVariable };
};
