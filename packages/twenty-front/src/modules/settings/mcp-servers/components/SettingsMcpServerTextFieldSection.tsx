import { Controller, useFormContext } from 'react-hook-form';
import { Section } from 'twenty-ui/components/layout';

import { type McpServerFormValues } from '@/settings/mcp-servers/validation-schemas/mcpServerFormSchema';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';

type SettingsMcpServerTextFieldSectionProps = {
  name: 'label' | 'name' | 'url';
  instanceId: string;
  title: string;
  description: string;
  placeholder: string;
  disabled?: boolean;
  autoFocus?: boolean;
};

export const SettingsMcpServerTextFieldSection = ({
  name,
  instanceId,
  title,
  description,
  placeholder,
  disabled,
  autoFocus,
}: SettingsMcpServerTextFieldSectionProps) => {
  const { control } = useFormContext<McpServerFormValues>();

  return (
    <Section.Root>
      <Section.Header title={title} description={description} />
      <Controller
        name={name}
        control={control}
        render={({
          field: { onChange, onBlur, value },
          fieldState: { error },
        }) => (
          <SettingsTextInput
            instanceId={instanceId}
            placeholder={placeholder}
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
    </Section.Root>
  );
};
