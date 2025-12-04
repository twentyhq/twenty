import { Controller, useFormContext } from 'react-hook-form';
import { SettingsOptionCardContentSelect } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSelect';
import { t } from '@lingui/core/macro';
import { IconClick, IconCopy } from 'twenty-ui/display';
import { Select } from '@/ui/input/components/Select';

export type FieldActionMode = 'copy' | 'navigate';

type SettingsDataModelFieldPrimaryActionModeFormValues = {
  settings?: {
    actionMode?: FieldActionMode;
  };
};

type SettingsDataModelFieldPrimaryActionModeFormProps = {
  disabled?: boolean;
  fieldType: string;
};

const ACTIONABLE_FIELD_TYPES = ['PHONES', 'EMAILS', 'LINKS'];

export const SettingsDataModelFieldPrimaryActionModeForm = ({
  disabled = false,
  fieldType,
}: SettingsDataModelFieldPrimaryActionModeFormProps) => {
  const { control, watch } =
    useFormContext<SettingsDataModelFieldPrimaryActionModeFormValues>();

  // Only show for actionable field types
  if (!ACTIONABLE_FIELD_TYPES.includes(fieldType)) {
    return null;
  }

  const settings = watch('settings');

  return (
    <Controller
      name="settings.actionMode"
      defaultValue={settings?.actionMode ?? 'copy'}
      control={control}
      render={({ field: { onChange, value } }) => {
        return (
          <SettingsOptionCardContentSelect
            Icon={IconClick}
            title={t`Action Mode`}
            description={t`Choose what happens when clicking on a field value`}
          >
            <Select
              dropdownId="field-action-mode-select"
              label="Select an option"
              options={[
                { value: 'copy', label: t`Copy to Clipboard`, Icon: IconCopy },
                {
                  value: 'navigate',
                  label: t`Navigate to Value`,
                  Icon: IconClick,
                },
              ]}
              value={(value as FieldActionMode) ?? 'copy'}
              onChange={(newValue) => onChange(newValue as FieldActionMode)}
            />
          </SettingsOptionCardContentSelect>
        );
      }}
    />
  );
};
