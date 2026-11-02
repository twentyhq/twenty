import { enqueueSnackbar } from 'twenty-sdk/front-component';

import { useUpdateApplicationVariable } from 'src/front-components/hooks/use-update-application-variable';
import { type ApplicationVariableScope } from 'src/front-components/types/application-variable-scope.type';

type SaveApplicationVariableParams = {
  variableKey: string;
  value: string;
  scope: ApplicationVariableScope;
};

export const useSaveApplicationVariable = () => {
  const { updateApplicationVariable } = useUpdateApplicationVariable();

  const saveApplicationVariable = async ({
    variableKey,
    value,
    scope,
  }: SaveApplicationVariableParams) => {
    const isUpdated = await updateApplicationVariable({
      variableKey,
      value,
      scope,
    });

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
