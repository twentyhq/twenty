import { type AppPreferenceVariable } from '@/settings/app-preferences/types/AppPreferenceVariable';
import { getAppPreferenceVariableOptions } from '@/settings/app-preferences/utils/getAppPreferenceVariableOptions';
import { Select } from '@/ui/input/components/Select';
import { TextInput } from '@/ui/input/components/TextInput';
import { useLingui } from '@lingui/react/macro';
import { useId } from 'react';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { SettingsApplicationVariableInput } from '~/pages/settings/applications/components/SettingsApplicationVariableInput';
import { getApplicationVariableDisplayLabel } from '~/pages/settings/applications/utils/getApplicationVariableDisplayLabel';

type SettingsAppPreferencesVariableInputProps = {
  variable: AppPreferenceVariable;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
};

export const SettingsAppPreferencesVariableInput = ({
  variable,
  value,
  onChange,
  disabled,
}: SettingsAppPreferencesVariableInputProps) => {
  const { t } = useLingui();
  const dropdownId = useId();
  const label = getApplicationVariableDisplayLabel(variable);

  if (
    !variable.isSecret &&
    (variable.type === FieldMetadataType.SELECT ||
      variable.type === FieldMetadataType.BOOLEAN)
  ) {
    const options =
      variable.type === FieldMetadataType.BOOLEAN
        ? [
            { label: t`True`, value: 'true' },
            { label: t`False`, value: 'false' },
          ]
        : getAppPreferenceVariableOptions(variable.options);
    const emptyOption = {
      label: variable.isRequired ? t`Select a value` : t`No value`,
      value: '',
    };

    return (
      <Select
        aria-label={label}
        dropdownId={dropdownId}
        options={variable.isRequired ? options : [emptyOption, ...options]}
        emptyOption={emptyOption}
        value={value}
        onChange={onChange}
        disabled={disabled}
        dropdownWidthAuto
        fullWidth
      />
    );
  }

  const isNumber =
    variable.type === FieldMetadataType.NUMBER ||
    variable.type === FieldMetadataType.NUMERIC;

  if (
    variable.isSecret ||
    isNumber ||
    variable.type === FieldMetadataType.TEXT ||
    !isDefined(variable.type)
  ) {
    return (
      <TextInput
        aria-label={label}
        value={value}
        onChange={onChange}
        type={variable.isSecret ? 'password' : 'text'}
        inputProps={{
          inputMode: isNumber && !variable.isSecret ? 'decimal' : 'text',
        }}
        autoComplete="off"
        disabled={disabled}
        placeholder={t`Value`}
        fullWidth
      />
    );
  }

  return (
    <SettingsApplicationVariableInput
      type={variable.type}
      value={value}
      options={getAppPreferenceVariableOptions(variable.options)}
      onChange={onChange}
      disabled={disabled}
      placeholder={t`Value`}
    />
  );
};
