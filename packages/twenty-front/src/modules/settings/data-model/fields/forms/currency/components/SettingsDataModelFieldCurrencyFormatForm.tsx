import { Controller, useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { SettingsOptionCardContentSelect } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSelect';
import { Select } from '@/ui/input/components/Select';
import { useLingui } from '@lingui/react/macro';
import { IconEye } from 'twenty-ui/display';

export const settingsDataModelFieldCurrencyFormatFormSchema = z.object({
  settings: z.object({
    format: z.enum(['short', 'full']),
  }),
});

export type SettingsDataModelFieldCurrencyFormatFormValues = z.infer<
  typeof settingsDataModelFieldCurrencyFormatFormSchema
>;

type SettingsDataModelFieldCurrencyFormatFormProps = {
  disabled?: boolean;
  fieldMetadataItem: Pick<FieldMetadataItem, 'settings'>;
};

const CURRENCY_FORMAT_OPTIONS = [
  { value: 'short', label: 'Short (e.g. 12M)' },
  { value: 'full', label: 'Full (e.g. 12,000,000)' },
];

export const SettingsDataModelFieldCurrencyFormatForm = ({
  disabled,
  fieldMetadataItem,
}: SettingsDataModelFieldCurrencyFormatFormProps) => {
  const { t } = useLingui();
  const { control } = useFormContext<SettingsDataModelFieldCurrencyFormatFormValues>();

  return (
    <Controller
      name="settings.format"
      defaultValue={fieldMetadataItem?.settings?.format ?? 'short'}
      control={control}
      render={({ field: { onChange, value } }) => (
        <SettingsOptionCardContentSelect
          Icon={IconEye}
          title={t`Format`}
          description={t`Choose how currency values should be displayed`}
        >
          <Select<string>
            selectSizeVariant="small"
            dropdownId="currency-format"
            dropdownWidth={220}
            value={value}
            onChange={onChange}
            disabled={disabled}
            needIconCheck={false}
            options={CURRENCY_FORMAT_OPTIONS}
          />
        </SettingsOptionCardContentSelect>
      )}
    />
  );
}; 