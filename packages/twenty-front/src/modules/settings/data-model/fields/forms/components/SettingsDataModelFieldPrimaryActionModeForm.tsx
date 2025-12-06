import { SettingsOptionCardContentSelect } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSelect';
import { Select } from '@/ui/input/components/Select';
import { t } from '@lingui/core/macro';
import { Controller, useFormContext } from 'react-hook-form';
import { IconArrowUpRight, IconClick, IconCopy } from 'twenty-ui/display';

export type FieldActionMode = 'copy' | 'navigate';

type SettingsDataModelFieldPrimaryActionModeFormValues = {
  settings?: {
    actionMode?: FieldActionMode;
  };
};

type SettingsDataModelFieldPrimaryActionModeFormProps = {
  fieldType: string;
};

const ACTIONABLE_FIELD_TYPES = ['PHONES', 'EMAILS', 'LINKS'];

export const SettingsDataModelFieldPrimaryActionModeForm = ({
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
                { value: 'copy', label: t`Copy to clipboard`, Icon: IconCopy },
                {
                  value: 'navigate',
                  label: t`Open link`,
                  Icon: IconArrowUpRight,
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
