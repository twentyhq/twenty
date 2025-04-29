import { useLingui } from '@lingui/react/macro';

import { isConfigVariablesInDbEnabledState } from '@/client-config/states/isConfigVariablesInDbEnabledState';
import { TextInputV2 } from '@/ui/input/components/TextInputV2';
import { useRecoilValue } from 'recoil';
import { ConfigVariable } from '~/generated/graphql';
import { ConfigVariableDatabaseInput } from './ConfigVariableDatabaseInput';

type ConfigVariableValueProps = {
  variable: ConfigVariable;
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
          placeholder={
            disabled ? 'Undefined' : t`Enter a value to store in database`
          }
        />
      ) : (
        <TextInputV2 value={String(value)} disabled label={t`Value`} />
      )}
    </>
  );
};
