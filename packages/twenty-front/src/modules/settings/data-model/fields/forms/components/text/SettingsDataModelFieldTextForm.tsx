import { Controller, useFormContext } from 'react-hook-form';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { SettingsOptionCardContentSelect } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSelect';
import { Select } from '@/ui/input/components/Select';
import { useTranslation } from 'react-i18next';
import { IconTextWrap } from 'twenty-ui';
import { z } from 'zod';

type SettingsDataModelFieldTextFormProps = {
  disabled?: boolean;
  fieldMetadataItem: Pick<
    FieldMetadataItem,
    'icon' | 'label' | 'type' | 'defaultValue' | 'settings'
  >;
};

export const textFieldDefaultValueSchema = z.object({
  displayedMaxRows: z.number().nullable(),
});

export const settingsDataModelFieldtextFormSchema = z.object({
  settings: textFieldDefaultValueSchema,
});

export type SettingsDataModelFieldTextFormValues = z.infer<
  typeof settingsDataModelFieldtextFormSchema
>;

export const SettingsDataModelFieldTextForm = ({
  disabled,
  fieldMetadataItem,
}: SettingsDataModelFieldTextFormProps) => {
  const { control } = useFormContext<SettingsDataModelFieldTextFormValues>();
  const { t } = useTranslation();

  return (
    <Controller
      name="settings"
      defaultValue={{
        displayedMaxRows: fieldMetadataItem?.settings?.displayedMaxRows || 0,
      }}
      control={control}
      render={({ field: { onChange, value } }) => {
        const displayedMaxRows = value?.displayedMaxRows ?? 0;

        return (
          <>
            <SettingsOptionCardContentSelect
              Icon={IconTextWrap}
              title={t('wrapOnRecordPages')}
              description={t('displayTextMultipleLines')}
            >
              <Select<number>
                dropdownId="text-wrap"
                value={displayedMaxRows}
                onChange={(value) => onChange({ displayedMaxRows: value })}
                disabled={disabled}
                options={[
                  {
                    label: t('deactivated'),
                    value: 0,
                  },
                  {
                    label: `${t('first')} 2 ${t('lines')}`,
                    value: 2,
                  },
                  {
                    label: `${t('first')} 5 ${t('lines')}`,
                    value: 5,
                  },
                  {
                    label: `${t('first')} 10 ${t('lines')}`,
                    value: 10,
                  },
                  {
                    label: `${t('allLines')} ${t('lines')}`,
                    value: 99,
                  },
                ]}
                selectSizeVariant="small"
              />
            </SettingsOptionCardContentSelect>
          </>
        );
      }}
    />
  );
};
