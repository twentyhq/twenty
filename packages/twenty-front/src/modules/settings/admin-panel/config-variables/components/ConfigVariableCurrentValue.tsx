import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';

import { TextArea } from '@/ui/input/components/TextArea';
import { TextInput } from '@/ui/input/components/TextInput';
import { IconEye, IconEyeOff } from 'twenty-ui/display';

import { ConfigVariableWithTypes } from '../types/ConfigVariableWithTypes';
import { getSensitiveDisplayValue } from '../utils/getSensitiveDisplayValue';

type ConfigVariableCurrentValueProps = {
  variable: ConfigVariableWithTypes;
};

export const ConfigVariableCurrentValue = ({
  variable,
}: ConfigVariableCurrentValueProps) => {
  const [showSensitiveValue, setShowSensitiveValue] = useState(false);
  const { t } = useLingui();

  const handleToggleVisibility = () => {
    setShowSensitiveValue(!showSensitiveValue);
  };

  const displayValue = getSensitiveDisplayValue(variable, showSensitiveValue);
  const isEmpty = displayValue === 'Not set';

  return (
    <>
      <TextInput
        value={displayValue}
        label={t`Current Value`}
        readOnly
        fullWidth
        disabled={isEmpty}
        RightIcon={
          variable.isSensitive && variable.value && variable.value !== ''
            ? showSensitiveValue
              ? IconEyeOff
              : IconEye
            : undefined
        }
        onRightIconClick={
          variable.isSensitive && variable.value && variable.value !== ''
            ? handleToggleVisibility
            : undefined
        }
      />

      <TextArea
        value={variable.description}
        disabled
        minRows={3}
        label={t`Description`}
      />
    </>
  );
};
