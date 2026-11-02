import { isUndefined } from '@sniptt/guards';
import { useCallback, useRef } from 'react';
import { useDebouncedCallback } from 'use-debounce';

import { APPLICATION_VARIABLE_SAVE_DEBOUNCE_MILLISECONDS } from 'src/front-components/constants/application-variable-save-debounce.constant';
import { useSaveApplicationVariable } from 'src/front-components/hooks/use-save-application-variable';
import { type ApplicationVariableScope } from 'src/front-components/types/application-variable-scope.type';
import { createApplicationVariableSaveQueue } from 'src/front-components/utils/create-application-variable-save-queue.util';

type UseAutosaveApplicationVariableParams = {
  variableKey: string;
  scope?: ApplicationVariableScope;
  onSaveSuccess?: (value: string) => void | Promise<void>;
  onSaveError?: (value: string) => void;
};

export const useAutosaveApplicationVariable = ({
  variableKey,
  scope = 'WORKSPACE',
  onSaveSuccess,
  onSaveError,
}: UseAutosaveApplicationVariableParams) => {
  const { saveApplicationVariable } = useSaveApplicationVariable();
  const saveApplicationVariableRef = useRef(saveApplicationVariable);
  const onSaveSuccessRef = useRef(onSaveSuccess);
  const onSaveErrorRef = useRef(onSaveError);
  const variableKeyRef = useRef(variableKey);
  const scopeRef = useRef(scope);

  saveApplicationVariableRef.current = saveApplicationVariable;
  onSaveSuccessRef.current = onSaveSuccess;
  onSaveErrorRef.current = onSaveError;
  variableKeyRef.current = variableKey;
  scopeRef.current = scope;

  const saveQueueRef = useRef<
    ReturnType<typeof createApplicationVariableSaveQueue> | undefined
  >(undefined);

  if (isUndefined(saveQueueRef.current)) {
    saveQueueRef.current = createApplicationVariableSaveQueue({
      saveValue: async (value, isSupersededValue) => {
        const isSaved = await saveApplicationVariableRef.current({
          variableKey: variableKeyRef.current,
          value,
          scope: scopeRef.current,
        });

        if (isSaved) {
          await onSaveSuccessRef.current?.(value);

          return;
        }

        if (isSupersededValue()) {
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
