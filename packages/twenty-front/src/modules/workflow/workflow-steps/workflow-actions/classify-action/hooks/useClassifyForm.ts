import { type WorkflowClassifyAction } from '@/workflow/types/Workflow';
import { useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

export type WorkflowClassifyInput = WorkflowClassifyAction['settings']['input'];

export type UseClassifyFormParams = {
  action: WorkflowClassifyAction;
  onActionUpdate?: (action: WorkflowClassifyAction) => void;
  readonly: boolean;
};

export const useClassifyForm = ({
  action,
  onActionUpdate,
  readonly,
}: UseClassifyFormParams) => {
  const [input, setInput] = useState<WorkflowClassifyInput>(
    action.settings.input,
  );

  const saveAction = useDebouncedCallback(
    (updatedInput: WorkflowClassifyInput) => {
      if (readonly) {
        return;
      }

      onActionUpdate?.({
        ...action,
        settings: { ...action.settings, input: updatedInput },
      });
    },
    500,
  );

  useEffect(() => {
    return () => {
      saveAction.flush();
    };
  }, [saveAction]);

  const updateInput = (update: Partial<WorkflowClassifyInput>) => {
    if (readonly) {
      return;
    }

    const updatedInput = { ...input, ...update };

    setInput(updatedInput);
    saveAction(updatedInput);
  };

  return { input, updateInput };
};
