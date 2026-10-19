import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { type ComponentState } from '@/ui/utilities/state/jotai/types/ComponentState';
import { useEffect, useState } from 'react';
import { isDefined, removeUndefinedFields } from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useSyncStepFilterStateFromDefaultValue = <TValue>({
  stepFilterSettingState,
  defaultValue,
}: {
  stepFilterSettingState: ComponentState<TValue>;
  defaultValue: TValue | undefined;
}) => {
  const [stepFilterSetting, setStepFilterSetting] = useAtomComponentState(
    stepFilterSettingState,
  );

  const [lastSyncedDefaultValue, setLastSyncedDefaultValue] = useState<
    TValue | undefined
  >(undefined);

  const [pastStepFilterSettings, setPastStepFilterSettings] = useState<
    unknown[]
  >([]);

  useEffect(() => {
    setPastStepFilterSettings((previousStepFilterSettings) => [
      ...previousStepFilterSettings,
      removeUndefinedFields(stepFilterSetting),
    ]);
  }, [stepFilterSetting]);

  useEffect(() => {
    if (!isDefined(defaultValue)) {
      return;
    }

    if (isDeeplyEqual(lastSyncedDefaultValue, defaultValue)) {
      return;
    }

    setLastSyncedDefaultValue(defaultValue);

    if (!isDefined(lastSyncedDefaultValue)) {
      // The atom outlives this component, so what it held before mount is not ours.
      setPastStepFilterSettings([]);
      setStepFilterSetting(defaultValue);
      return;
    }

    // Each edit is saved without debounce and save responses land after newer
    // edits, so a value this editor already held is a stale echo, not a change.
    const normalizedDefaultValue = removeUndefinedFields(defaultValue);
    const isEchoOfLocalEdit = pastStepFilterSettings.some(
      (pastStepFilterSetting) =>
        isDeeplyEqual(pastStepFilterSetting, normalizedDefaultValue),
    );

    if (isEchoOfLocalEdit) {
      return;
    }

    setStepFilterSetting(defaultValue);
  }, [
    defaultValue,
    lastSyncedDefaultValue,
    pastStepFilterSettings,
    setStepFilterSetting,
  ]);
};
