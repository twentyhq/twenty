import { useCallback, useEffect, useRef } from 'react';
import { enqueueSnackbar } from 'twenty-sdk/front-component';

import { APPLICATION_VARIABLE_SAVE_DEBOUNCE_MILLISECONDS } from 'src/front-components/constants/application-variable-save-debounce.constant';
import { useUpdateApplicationVariable } from 'src/front-components/hooks/use-update-application-variable';

// One timer per variable: a single shared debounce would drop the first write
// whenever two rows are edited inside the same debounce window.
export const useSaveApplicationVariables = (applicationId: string) => {
  const { updateApplicationVariable } =
    useUpdateApplicationVariable(applicationId);

  const updateApplicationVariableRef = useRef(updateApplicationVariable);
  updateApplicationVariableRef.current = updateApplicationVariable;

  const timeoutByVariableKey = useRef(
    new Map<string, ReturnType<typeof setTimeout>>(),
  );
  const pendingValueByVariableKey = useRef(new Map<string, string>());

  const persistVariable = useCallback(async (variableKey: string) => {
    const value = pendingValueByVariableKey.current.get(variableKey);

    if (value === undefined) {
      return;
    }

    pendingValueByVariableKey.current.delete(variableKey);

    const isUpdated = await updateApplicationVariableRef.current({
      variableKey,
      value,
    });

    if (!isUpdated) {
      enqueueSnackbar({
        message: `Could not save ${variableKey}.`,
        variant: 'error',
      });
    }
  }, []);

  const cancelVariable = useCallback((variableKey: string) => {
    const timeout = timeoutByVariableKey.current.get(variableKey);

    if (timeout !== undefined) {
      clearTimeout(timeout);
      timeoutByVariableKey.current.delete(variableKey);
    }

    pendingValueByVariableKey.current.delete(variableKey);
  }, []);

  const saveVariable = useCallback(
    (variableKey: string, value: string) => {
      const timeout = timeoutByVariableKey.current.get(variableKey);

      if (timeout !== undefined) {
        clearTimeout(timeout);
      }

      pendingValueByVariableKey.current.set(variableKey, value);

      timeoutByVariableKey.current.set(
        variableKey,
        setTimeout(() => {
          timeoutByVariableKey.current.delete(variableKey);
          persistVariable(variableKey);
        }, APPLICATION_VARIABLE_SAVE_DEBOUNCE_MILLISECONDS),
      );
    },
    [persistVariable],
  );

  const flushVariable = useCallback(
    (variableKey: string) => {
      const timeout = timeoutByVariableKey.current.get(variableKey);

      if (timeout === undefined) {
        return;
      }

      clearTimeout(timeout);
      timeoutByVariableKey.current.delete(variableKey);
      persistVariable(variableKey);
    },
    [persistVariable],
  );

  useEffect(() => {
    const timeouts = timeoutByVariableKey.current;

    return () => {
      for (const timeout of timeouts.values()) {
        clearTimeout(timeout);
      }

      timeouts.clear();
    };
  }, []);

  return { saveVariable, flushVariable, cancelVariable };
};
