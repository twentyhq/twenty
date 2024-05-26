import { Controller, useFormContext } from 'react-hook-form';
import omit from 'lodash.omit';
import { z } from 'zod';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import {
  SETTINGS_FIELD_TYPE_CONFIGS,
  SettingsFieldTypeConfig,
} from '@/settings/data-model/constants/SettingsFieldTypeConfigs';
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
  fieldMetadataItem?: FieldMetadataItem;
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
          onChange={onChange}
          options={fieldTypeOptions}
        />
      )}
    />
  );
};
