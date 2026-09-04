import { isUndefined } from '@sniptt/guards';
import { useCallback, useRef } from 'react';
import { useDebouncedCallback } from 'use-debounce';

import { APPLICATION_VARIABLE_SAVE_DEBOUNCE_MILLISECONDS } from 'src/front-components/constants/application-variable-save-debounce.constant';
import { useSaveApplicationVariable } from 'src/front-components/hooks/use-save-application-variable';
import { createApplicationVariableSaveQueue } from 'src/front-components/utils/create-application-variable-save-queue.util';

type UseAutosaveApplicationVariableParams = {
  frontComponentId: string;
  variableKey: string;
  onSaveSuccess?: (value: string) => void | Promise<void>;
  onSaveError?: (value: string) => void;
};

export const useAutosaveApplicationVariable = ({
  frontComponentId,
  variableKey,
  onSaveSuccess,
  onSaveError,
}: UseAutosaveApplicationVariableParams) => {
  const { saveApplicationVariable } =
    useSaveApplicationVariable(frontComponentId);
  const saveApplicationVariableRef = useRef(saveApplicationVariable);
  const onSaveSuccessRef = useRef(onSaveSuccess);
  const onSaveErrorRef = useRef(onSaveError);
  const variableKeyRef = useRef(variableKey);

  saveApplicationVariableRef.current = saveApplicationVariable;
  onSaveSuccessRef.current = onSaveSuccess;
  onSaveErrorRef.current = onSaveError;
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
          // Awaited so the queue serializes the follow-up work of consecutive
          // saves; two toggles in a row must not sync concurrently.
          await onSaveSuccessRef.current?.(value);

          return;
        }

        onSaveErrorRef.current?.(value);
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
