import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { type ComponentState } from '@/ui/utilities/state/jotai/types/ComponentState';
import { useEffect, useState } from 'react';
import { isEchoOfPastStepFilterSetting } from '@/workflow/workflow-steps/filters/utils/isEchoOfPastStepFilterSetting';
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
    Array<TValue | Partial<TValue>>
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

    // Undebounced saves answer after newer edits: a value this editor held is a stale echo.
    if (
      isEchoOfPastStepFilterSetting({
        pastStepFilterSettings,
        incomingStepFilterSetting: defaultValue,
      })
    ) {
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
