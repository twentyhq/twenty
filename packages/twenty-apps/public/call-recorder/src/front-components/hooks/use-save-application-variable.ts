import { enqueueSnackbar } from 'twenty-sdk/front-component';

import { useUpdateApplicationVariable } from 'src/front-components/hooks/use-update-application-variable';

type SaveApplicationVariableParams = {
  variableKey: string;
  value: string;
};

export const useSaveApplicationVariable = () => {
  const { updateApplicationVariable } = useUpdateApplicationVariable();

  const saveApplicationVariable = async ({
    variableKey,
    value,
  }: SaveApplicationVariableParams) => {
    const isUpdated = await updateApplicationVariable({ variableKey, value });

    if (!isUpdated) {
      enqueueSnackbar({
        message: `Could not save ${variableKey}.`,
        variant: 'error',
      });
    }

    return isUpdated;
  };

  return { saveApplicationVariable };
};
