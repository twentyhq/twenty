import { useLingui } from '@lingui/react/macro';
import { Controller, useFormContext } from 'react-hook-form';
import { camelToSnakeCase } from 'twenty-shared/utils';

import { computeMetadataNameFromLabel } from '@/object-metadata/utils/computeMetadataNameFromLabel';
import { type McpServerFormValues } from '@/settings/mcp-servers/validation-schemas/mcpServerFormSchema';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';

type SettingsMcpServerLabelFieldProps = {
  instanceId: string;
  isNameSyncedWithLabel: boolean;
};

export const SettingsMcpServerLabelField = ({
  instanceId,
  isNameSyncedWithLabel,
}: SettingsMcpServerLabelFieldProps) => {
  const { t } = useLingui();
  const { control, getFieldState, setValue } =
    useFormContext<McpServerFormValues>();

  return (
    <Controller
      name="label"
      control={control}
      render={({
        field: { onChange, onBlur, value },
        fieldState: { error },
      }) => (
        <SettingsTextInput
          instanceId={instanceId}
          label={t`Label`}
          placeholder={t`Linear`}
          value={value}
          onChange={(label) => {
            onChange(label);

            if (isNameSyncedWithLabel && !getFieldState('name').isDirty) {
              setValue(
                'name',
                camelToSnakeCase(computeMetadataNameFromLabel(label)),
              );
            }
          }}
          onBlur={onBlur}
          error={error?.message}
          autoFocus={isNameSyncedWithLabel}
          fullWidth
        />
      )}
    />
  );
};
