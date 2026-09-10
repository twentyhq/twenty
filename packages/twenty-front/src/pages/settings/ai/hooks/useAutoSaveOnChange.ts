import { useEffect } from 'react';
import { type DebouncedState } from 'use-debounce';

export const useAutoSaveOnChange = ({
  autoSave,
  isEnabled,
  watchedValue,
}: {
  autoSave: DebouncedState<() => Promise<void>>;
  isEnabled: boolean;
  watchedValue: unknown;
}) => {
  useEffect(() => {
    if (isEnabled) {
      autoSave();
    }
  }, [autoSave, isEnabled, watchedValue]);

  useEffect(() => {
    return () => {
      autoSave.flush();
    };
  }, [autoSave]);
};
