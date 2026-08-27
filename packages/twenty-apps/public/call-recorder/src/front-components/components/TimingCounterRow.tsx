import { isUndefined } from '@sniptt/guards';
import { useId, useState } from 'react';
import { type IconComponent } from 'twenty-ui/icon';

import { SettingsOptionCardContentCounter } from 'src/front-components/components/SettingsOptionCardContentCounter';
import { useDebouncedSaveApplicationVariable } from 'src/front-components/hooks/use-debounced-save-application-variable';
import { getNormalizedNumberValue } from 'src/front-components/utils/get-normalized-number-value.util';

type TimingCounterRowProps = {
  applicationId: string;
  variableKey: string;
  title: string;
  description: string;
  Icon: IconComponent;
  divider: boolean;
  initialValue: string;
};

export const TimingCounterRow = ({
  applicationId,
  variableKey,
  title,
  description,
  Icon,
  divider,
  initialValue,
}: TimingCounterRowProps) => {
  const inputId = useId();
  const [draftValue, setDraftValue] = useState(initialValue);
  const { saveDebounced } = useDebouncedSaveApplicationVariable({
    applicationId,
    variableKey,
  });

  const handleChange = (value: string) => {
    setDraftValue(value);

    const valueToSave = getNormalizedNumberValue(value);

    if (isUndefined(valueToSave)) {
      saveDebounced.cancel();
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
      value={draftValue}
      errorMessage={
        isUndefined(getNormalizedNumberValue(draftValue))
          ? 'Invalid number'
          : undefined
      }
      onChange={handleChange}
      onBlur={() => saveDebounced.flush()}
    />
  );
};
