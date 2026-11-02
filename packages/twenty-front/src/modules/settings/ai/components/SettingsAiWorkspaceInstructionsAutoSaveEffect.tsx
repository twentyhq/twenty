import { useEffect } from 'react';

type SettingsAiWorkspaceInstructionsAutoSaveEffectProps = {
  flushAutoSave: () => void;
};

export const SettingsAiWorkspaceInstructionsAutoSaveEffect = ({
  flushAutoSave,
}: SettingsAiWorkspaceInstructionsAutoSaveEffectProps) => {
  useEffect(() => {
    return () => {
      flushAutoSave();
    };
  }, [flushAutoSave]);

  return null;
};
