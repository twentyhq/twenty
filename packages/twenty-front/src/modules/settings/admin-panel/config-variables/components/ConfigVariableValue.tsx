import { useLingui } from '@lingui/react/macro';

import { isConfigVariablesInDbEnabledState } from '@/client-config/states/isConfigVariablesInDbEnabledState';
import { TextArea } from '@/ui/input/components/TextArea';
import { useRecoilValue } from 'recoil';
import { ConfigVariableWithTypes } from '../types/ConfigVariableWithTypes';
import { ConfigVariableDatabaseInput } from './ConfigVariableDatabaseInput';

type ConfigVariableValueProps = {
  variable: ConfigVariableWithTypes;
  value: string | number | boolean | string[] | null;
  onChange: (value: string | number | boolean | string[] | null) => void;
  disabled?: boolean;
};

export const ConfigVariableValue = ({
  variable,
  value,
  onChange,
  disabled,
}: ConfigVariableValueProps) => {
  const { t } = useLingui();
  const isConfigVariablesInDbEnabled = useRecoilValue(
    isConfigVariablesInDbEnabledState,
  );

  return (
    <>
      {isConfigVariablesInDbEnabled && !variable.isEnvOnly ? (
        <ConfigVariableDatabaseInput
          label={t`Value`}
          value={value}
          onChange={onChange}
          type={variable.type}
          options={variable.options}
          disabled={disabled}
          placeholder={t`Enter a value to store in database`}
        />
      ) : (
        <TextArea value={String(value)} disabled label={t`Value`} />
      )}
    </>
  );
};
