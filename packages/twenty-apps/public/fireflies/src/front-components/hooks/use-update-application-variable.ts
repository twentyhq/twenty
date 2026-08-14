import { useRef } from 'react';
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
  const pendingUpdateRef = useRef<Promise<boolean>>(Promise.resolve(true));

  const performUpdate = async ({
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

  const updateApplicationVariable = (
    params: UpdateApplicationVariableParams,
  ): Promise<boolean> => {
    const queuedUpdate = pendingUpdateRef.current.then(() =>
      performUpdate(params),
    );

    pendingUpdateRef.current = queuedUpdate;

    return queuedUpdate;
  };

  return { updateApplicationVariable };
};
