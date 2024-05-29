import { Controller, useFormContext } from 'react-hook-form';
import omit from 'lodash.omit';
import { z } from 'zod';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import {
  SETTINGS_FIELD_TYPE_CONFIGS,
  SettingsFieldTypeConfig,
} from '@/settings/data-model/constants/SettingsFieldTypeConfigs';
import { useBooleanSettingsFormInitialValues } from '@/settings/data-model/fields/forms/boolean/hooks/useBooleanSettingsFormInitialValues';
import { useCurrencySettingsFormInitialValues } from '@/settings/data-model/fields/forms/currency/hooks/useCurrencySettingsFormInitialValues';
import { useSelectSettingsFormInitialValues } from '@/settings/data-model/fields/forms/select/hooks/useSelectSettingsFormInitialValues';
import { SettingsSupportedFieldType } from '@/settings/data-model/types/SettingsSupportedFieldType';
import { Select, SelectOption } from '@/ui/input/components/Select';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const settingsDataModelFieldTypeFormSchema = z.object({
  type: z.enum(
    Object.keys(SETTINGS_FIELD_TYPE_CONFIGS) as [
      SettingsSupportedFieldType,
      ...SettingsSupportedFieldType[],
    ],
  ),
});

type SettingsDataModelFieldTypeFormValues = z.infer<
  typeof settingsDataModelFieldTypeFormSchema
>;

type SettingsDataModelFieldTypeSelectProps = {
  className?: string;
  disabled?: boolean;
  excludedFieldTypes?: SettingsSupportedFieldType[];
  fieldMetadataItem?: Pick<
    FieldMetadataItem,
    'defaultValue' | 'options' | 'type'
  >;
};

export const SettingsDataModelFieldTypeSelect = ({
  className,
  disabled,
  excludedFieldTypes = [],
  fieldMetadataItem,
}: SettingsDataModelFieldTypeSelectProps) => {
  const { control } = useFormContext<SettingsDataModelFieldTypeFormValues>();

  const fieldTypeConfigs: Partial<
    Record<SettingsSupportedFieldType, SettingsFieldTypeConfig>
  > = omit(SETTINGS_FIELD_TYPE_CONFIGS, excludedFieldTypes);

  const fieldTypeOptions = Object.entries<SettingsFieldTypeConfig>(
    fieldTypeConfigs,
  ).map<SelectOption<SettingsSupportedFieldType>>(([key, dataTypeConfig]) => ({
    Icon: dataTypeConfig.Icon,
    label: dataTypeConfig.label,
    value: key as SettingsSupportedFieldType,
  }));

  const { resetDefaultValueField: resetBooleanDefaultValueField } =
    useBooleanSettingsFormInitialValues({ fieldMetadataItem });

  const { resetDefaultValueField: resetCurrencyDefaultValueField } =
    useCurrencySettingsFormInitialValues({ fieldMetadataItem });

  const { resetDefaultValueField: resetSelectDefaultValueField } =
    useSelectSettingsFormInitialValues({ fieldMetadataItem });

  // Reset defaultValue on type change with a valid value for the selected type
  // so the form does not become invalid.
  const resetDefaultValueField = (nextValue: SettingsSupportedFieldType) => {
    switch (nextValue) {
      case FieldMetadataType.Boolean:
        resetBooleanDefaultValueField();
        break;
      case FieldMetadataType.Currency:
        resetCurrencyDefaultValueField();
        break;
      case FieldMetadataType.Select:
      case FieldMetadataType.MultiSelect:
        resetSelectDefaultValueField();
        break;
      default:
        break;
    }
  };

  return (
    <Controller
      name="type"
      control={control}
      defaultValue={
        fieldMetadataItem && fieldMetadataItem.type in fieldTypeConfigs
          ? (fieldMetadataItem.type as SettingsSupportedFieldType)
          : FieldMetadataType.Text
      }
      render={({ field: { onChange, value } }) => (
        <Select
          className={className}
          fullWidth
          disabled={disabled}
          dropdownId="object-field-type-select"
          value={value}
          onChange={(nextValue) => {
            onChange(nextValue);
            resetDefaultValueField(nextValue);
          }}
          options={fieldTypeOptions}
        />
      )}
    />
  );
};
