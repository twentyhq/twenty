import { isUndefined } from '@sniptt/guards';
import { useId } from 'react';
import { type IconComponent } from 'twenty-ui/icon';

import { SettingsOptionCardContentCounter } from 'src/front-components/components/SettingsOptionCardContentCounter';
import {
  type ApplicationVariableDraft,
  type UpdateApplicationVariableDraft,
} from 'src/front-components/types/application-variable-draft.type';
import { getNormalizedNumberValue } from 'src/front-components/utils/get-normalized-number-value.util';

type TimingCounterRowProps = {
  variableKey: string;
  title: string;
  description: string;
  Icon: IconComponent;
  divider: boolean;
  persistedValue: string;
  draftValue: ApplicationVariableDraft | undefined;
  onDraftValueChange: UpdateApplicationVariableDraft;
};

export const TimingCounterRow = ({
  variableKey,
  title,
  description,
  Icon,
  divider,
  persistedValue,
  draftValue,
  onDraftValueChange,
}: TimingCounterRowProps) => {
  const inputId = useId();
  const inputValue = draftValue?.inputValue ?? persistedValue;

  const handleChange = (value: string) => {
    onDraftValueChange({
      variableKey,
      inputValue: value,
      valueToSave: getNormalizedNumberValue(value),
    });
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
    />
  );
};
