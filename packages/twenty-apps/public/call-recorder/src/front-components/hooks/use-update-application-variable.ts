import { MetadataApiClient } from 'twenty-client-sdk/metadata';

import { resolveCallRecorderApplicationId } from 'src/front-components/utils/resolve-call-recorder-application-id.util';

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
  frontComponentId: string,
): UpdateApplicationVariableState => {
  const updateApplicationVariable = async ({
    variableKey,
    value,
  }: UpdateApplicationVariableParams): Promise<boolean> => {
    try {
      const applicationId =
        await resolveCallRecorderApplicationId(frontComponentId);
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
