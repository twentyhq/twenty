import { type WorkflowMcpToolAction } from '@/workflow/types/Workflow';
import { useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

type UseMcpToolStepFormProps = {
  action: WorkflowMcpToolAction;
  readonly?: boolean;
  onActionUpdate?: (action: WorkflowMcpToolAction) => void;
};

export const useMcpToolStepForm = ({
  action,
  readonly,
  onActionUpdate,
}: UseMcpToolStepFormProps) => {
  const [settings, setSettings] = useState(action.settings);

  const saveAction = useDebouncedCallback(
    (updatedSettings: WorkflowMcpToolAction['settings']) => {
      if (readonly === true) {
        return;
      }

      onActionUpdate?.({ ...action, settings: updatedSettings });
    },
    500,
  );

  useEffect(() => {
    return () => {
      saveAction.flush();
    };
  }, [saveAction]);

  const updateSettings = (
    updatedSettings: WorkflowMcpToolAction['settings'],
  ) => {
    setSettings(updatedSettings);
    saveAction(updatedSettings);
  };

  return { settings, updateSettings };
};
