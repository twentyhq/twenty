import { isInteger } from '@sniptt/guards';
import { useState } from 'react';
import { type NumberStepperProps } from 'twenty-ui/components/input';
import { type IconComponent } from 'twenty-ui/icon';

import { SettingsOptionCardContentCounter } from 'src/front-components/components/SettingsOptionCardContentCounter';
import { useAutosaveApplicationVariable } from 'src/front-components/hooks/use-autosave-application-variable';
import { getNonNegativeIntegerValue } from 'src/front-components/utils/get-non-negative-integer-value.util';

const TYPING_CHANGE_REASONS: string[] = [
  'input-change',
  'input-paste',
  'input-clear',
];

type TimingCounterRowProps = {
  variableKey: string;
  title: string;
  description: string;
  Icon: IconComponent;
  divider: boolean;
  persistedValue: string;
};

export const TimingCounterRow = ({
  variableKey,
  title,
  description,
  Icon,
  divider,
  persistedValue,
}: TimingCounterRowProps) => {
  const [value, setValue] = useState(() =>
    getNonNegativeIntegerValue(persistedValue),
  );
  const { saveDebounced, saveImmediately } = useAutosaveApplicationVariable({
    variableKey,
  });

  const handleValueChange: NonNullable<NumberStepperProps['onValueChange']> = (
    nextValue,
    eventDetails,
  ) => {
    if (!isInteger(nextValue) || nextValue < 0 || nextValue === value) {
      return;
    }

    setValue(nextValue);

    if (TYPING_CHANGE_REASONS.includes(eventDetails.reason)) {
      saveDebounced(String(nextValue));
      return;
    }

    saveImmediately(String(nextValue));
  };

  return (
    <SettingsOptionCardContentCounter
      Icon={Icon}
      title={title}
      description={description}
      divider={divider}
      value={value}
      onValueChange={handleValueChange}
      onBlur={() => saveDebounced.flush()}
    />
  );
};
