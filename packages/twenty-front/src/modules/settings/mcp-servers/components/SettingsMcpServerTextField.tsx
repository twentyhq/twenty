import { Controller, useFormContext } from 'react-hook-form';

import { type McpServerFormValues } from '@/settings/mcp-servers/validation-schemas/mcpServerFormSchema';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';

type SettingsMcpServerTextFieldProps = {
  name: 'label' | 'name' | 'url';
  instanceId: string;
  label: string;
  placeholder: string;
  hint?: string;
  disabled?: boolean;
  autoFocus?: boolean;
};

export const SettingsMcpServerTextField = ({
  name,
  instanceId,
  label,
  placeholder,
  hint,
  disabled,
  autoFocus,
}: SettingsMcpServerTextFieldProps) => {
  const { control } = useFormContext<McpServerFormValues>();

  return (
    <Controller
      name={name}
      control={control}
      render={({
        field: { onChange, onBlur, value },
        fieldState: { error },
      }) => (
        <SettingsTextInput
          instanceId={instanceId}
          label={label}
          placeholder={placeholder}
          hint={hint}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          error={error?.message}
          disabled={disabled}
          autoFocus={autoFocus}
          fullWidth
        />
      )}
    />
  );
};
