import { isUndefined } from '@sniptt/guards';
import { useId, useState } from 'react';
import { type IconComponent } from 'twenty-ui/icon';

import { SettingsOptionCardContentCounter } from 'src/front-components/components/SettingsOptionCardContentCounter';
import { useAutosaveApplicationVariable } from 'src/front-components/hooks/use-autosave-application-variable';
import { getNormalizedNumberValue } from 'src/front-components/utils/get-normalized-number-value.util';

type TimingCounterRowProps = {
  frontComponentId: string;
  variableKey: string;
  title: string;
  description: string;
  Icon: IconComponent;
  divider: boolean;
  persistedValue: string;
};

export const TimingCounterRow = ({
  frontComponentId,
  variableKey,
  title,
  description,
  Icon,
  divider,
  persistedValue,
}: TimingCounterRowProps) => {
  const inputId = useId();
  const [inputValue, setInputValue] = useState(persistedValue);
  const { saveDebounced, saveImmediately } = useAutosaveApplicationVariable({
    frontComponentId,
    variableKey,
  });

  const handleChange = (value: string, changeType: 'input' | 'button') => {
    setInputValue(value);

    const valueToSave = getNormalizedNumberValue(value);

    if (isUndefined(valueToSave)) {
      saveDebounced.cancel();
      return;
    }

    if (changeType === 'button') {
      saveImmediately(valueToSave);
      return;
    }

    saveDebounced(valueToSave);
  };

  return (
    <SettingsOptionCardContentCounter
      Icon={Icon}
      title={title}
      description={description}
      divider={divider}
      inputId={inputId}
      value={inputValue}
      errorMessage={
        isUndefined(getNormalizedNumberValue(inputValue))
          ? 'Invalid number'
          : undefined
      }
      onChange={handleChange}
      onBlur={() => saveDebounced.flush()}
    />
  );
};
