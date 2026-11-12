import { type WorkflowMcpToolAction } from '@/workflow/types/Workflow';
import { useEffect, useRef, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

type McpToolStepSettings = WorkflowMcpToolAction['settings'];

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
  // oxlint-disable-next-line twenty/no-state-useref
  const latestSettingsRef = useRef(action.settings);

  const saveAction = useDebouncedCallback(
    (updatedSettings: McpToolStepSettings) => {
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

  const updateSettings = (settingsUpdate: Partial<McpToolStepSettings>) => {
    const updatedSettings = {
      ...latestSettingsRef.current,
      ...settingsUpdate,
    };

    latestSettingsRef.current = updatedSettings;
    setSettings(updatedSettings);
    saveAction(updatedSettings);
  };

  return { settings, updateSettings, flushPendingSave: saveAction.flush };
};
