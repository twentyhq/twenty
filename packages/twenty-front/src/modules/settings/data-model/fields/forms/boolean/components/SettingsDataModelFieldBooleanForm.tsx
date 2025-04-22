import { Controller, useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { SettingsOptionCardContentSelect } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSelect';
import { useBooleanSettingsFormInitialValues } from '@/settings/data-model/fields/forms/boolean/hooks/useBooleanSettingsFormInitialValues';
import { Select } from '@/ui/input/components/Select';
import { useLingui } from '@lingui/react/macro';
import { IconCheck } from 'twenty-ui/display';
import { BOOLEAN_DATA_MODEL_SELECT_OPTIONS } from '@/settings/data-model/fields/forms/boolean/constants/BooleanDataModelSelectOptions';

export const settingsDataModelFieldBooleanFormSchema = z.object({
  defaultValue: z.boolean(),
});

export type SettingsDataModelFieldBooleanFormValues = z.infer<
  typeof settingsDataModelFieldBooleanFormSchema
>;

type SettingsDataModelFieldBooleanFormProps = {
  fieldMetadataItem: Pick<FieldMetadataItem, 'defaultValue'>;
};

export const SettingsDataModelFieldBooleanForm = ({
  fieldMetadataItem,
}: SettingsDataModelFieldBooleanFormProps) => {
  const { t } = useLingui();
  const { control } = useFormContext<SettingsDataModelFieldBooleanFormValues>();

  const { initialDefaultValue } = useBooleanSettingsFormInitialValues({
    fieldMetadataItem,
  });

  return (
    <Controller
      name="defaultValue"
      control={control}
      defaultValue={initialDefaultValue}
      render={({ field: { onChange, value } }) => (
        <SettingsOptionCardContentSelect
          Icon={IconCheck}
          title={t`Default Value`}
          description={t`Select the default value for this boolean field`}
        >
          <Select<boolean>
            value={value}
            onChange={onChange}
            dropdownId="object-field-default-value-select-boolean"
            dropdownWidth={120}
            needIconCheck={false}
            options={BOOLEAN_DATA_MODEL_SELECT_OPTIONS.map((option) => ({
              ...option,
              label: t(option.label),
            }))}
            selectSizeVariant="small"
          />
        </SettingsOptionCardContentSelect>
      )}
    />
  );
};
