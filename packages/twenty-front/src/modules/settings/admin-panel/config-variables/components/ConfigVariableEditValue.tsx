import { useLingui } from '@lingui/react/macro';

import { ConfigSource } from '~/generated/graphql';

import { ConfigVariableWithTypes } from '../types/ConfigVariableWithTypes';
import { ConfigVariableDatabaseInput } from './ConfigVariableDatabaseInput';

type ConfigVariableEditValueProps = {
  variable: ConfigVariableWithTypes;
  value: string | number | boolean | string[] | null;
  onChange: (value: string | number | boolean | string[] | null) => void;
  disabled?: boolean;
};

export const ConfigVariableEditValue = ({
  variable,
  value,
  onChange,
  disabled,
}: ConfigVariableEditValueProps) => {
  const { t } = useLingui();
  const isFromDatabase = variable.source === ConfigSource.DATABASE;

  return (
    <ConfigVariableDatabaseInput
      label={isFromDatabase ? t`Edit Value` : t`Set Custom Value`}
      value={value}
      onChange={onChange}
      type={variable.type}
      options={variable.options}
      disabled={disabled}
      placeholder={
        variable.isEnvOnly
          ? t`This variable cannot be modified`
          : isFromDatabase
            ? t`Current value`
            : t`Enter a value to store in database`
      }
    />
  );
};
