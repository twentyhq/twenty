import { isUndefined } from '@sniptt/guards';
import { useCallback, useRef } from 'react';
import { useDebouncedCallback } from 'use-debounce';

import { APPLICATION_VARIABLE_SAVE_DEBOUNCE_MILLISECONDS } from 'src/front-components/constants/application-variable-save-debounce.constant';
import { useSaveApplicationVariable } from 'src/front-components/hooks/use-save-application-variable';
import { createApplicationVariableSaveQueue } from 'src/front-components/utils/create-application-variable-save-queue.util';

type UseAutosaveApplicationVariableParams = {
  frontComponentId: string;
  variableKey: string;
  onSaveSuccess?: (value: string) => void;
};

export const useAutosaveApplicationVariable = ({
  frontComponentId,
  variableKey,
  onSaveSuccess,
}: UseAutosaveApplicationVariableParams) => {
  const { saveApplicationVariable } =
    useSaveApplicationVariable(frontComponentId);
  const saveApplicationVariableRef = useRef(saveApplicationVariable);
  const onSaveSuccessRef = useRef(onSaveSuccess);
  const variableKeyRef = useRef(variableKey);

  saveApplicationVariableRef.current = saveApplicationVariable;
  onSaveSuccessRef.current = onSaveSuccess;
  variableKeyRef.current = variableKey;

  const saveQueueRef = useRef<
    ReturnType<typeof createApplicationVariableSaveQueue> | undefined
  >(undefined);

  if (isUndefined(saveQueueRef.current)) {
    saveQueueRef.current = createApplicationVariableSaveQueue({
      saveValue: async (value) => {
        const isSaved = await saveApplicationVariableRef.current({
          variableKey: variableKeyRef.current,
          value,
        });

        if (isSaved) {
          onSaveSuccessRef.current?.(value);
        }
      },
    });
  }

  const saveDebounced = useDebouncedCallback(
    saveQueueRef.current.enqueueSave,
    APPLICATION_VARIABLE_SAVE_DEBOUNCE_MILLISECONDS,
  );

  const saveImmediately = useCallback(
    (value: string) => {
      saveDebounced.cancel();
      saveQueueRef.current?.enqueueSave(value);
    },
    [saveDebounced],
  );

  return { saveDebounced, saveImmediately };
};
