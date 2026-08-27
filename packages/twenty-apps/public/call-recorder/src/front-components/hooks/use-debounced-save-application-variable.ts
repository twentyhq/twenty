import { useDebouncedCallback } from 'use-debounce';

import { APPLICATION_VARIABLE_SAVE_DEBOUNCE_MILLISECONDS } from 'src/front-components/constants/application-variable-save-debounce.constant';
import { useSaveApplicationVariable } from 'src/front-components/hooks/use-save-application-variable';

type UseDebouncedSaveApplicationVariableParams = {
  applicationId: string;
  variableKey: string;
};

export const useDebouncedSaveApplicationVariable = ({
  applicationId,
  variableKey,
}: UseDebouncedSaveApplicationVariableParams) => {
  const { saveApplicationVariable } = useSaveApplicationVariable(applicationId);

  const saveDebounced = useDebouncedCallback(
    (value: string) => saveApplicationVariable({ variableKey, value }),
    APPLICATION_VARIABLE_SAVE_DEBOUNCE_MILLISECONDS,
  );

  return { saveDebounced };
};
