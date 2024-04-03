import omit from 'lodash.omit';

import {
  SETTINGS_FIELD_TYPE_CONFIGS,
  SettingsFieldTypeConfig,
} from '@/settings/data-model/constants/SettingsFieldTypeConfigs';
import { SettingsSupportedFieldType } from '@/settings/data-model/types/SettingsSupportedFieldType';
import { Select, SelectOption } from '@/ui/input/components/Select';
import { FieldMetadataType } from '~/generated-metadata/graphql';

type SettingsDataModelFieldTypeSelectProps = {
  className?: string;
  disabled?: boolean;
  excludedFieldTypes?: SettingsSupportedFieldType[];
  onChange?: ({
    type,
    defaultValue,
  }: {
    type: SettingsSupportedFieldType;
    defaultValue: any;
  }) => void;
  value?: SettingsSupportedFieldType;
};

export const SettingsDataModelFieldTypeSelect = ({
  className,
  disabled,
  excludedFieldTypes = [],
  onChange,
  value,
}: SettingsDataModelFieldTypeSelectProps) => {
  const fieldTypeConfigs = omit(
    SETTINGS_FIELD_TYPE_CONFIGS,
    excludedFieldTypes,
  );
  const fieldTypeOptions = Object.entries<SettingsFieldTypeConfig>(
    fieldTypeConfigs,
  ).map<SelectOption<SettingsSupportedFieldType>>(([key, dataTypeConfig]) => ({
    Icon: dataTypeConfig.Icon,
    label: dataTypeConfig.label,
    value: key as SettingsSupportedFieldType,
  }));

  return (
    <Select
      className={className}
      fullWidth
      disabled={disabled}
      dropdownId="object-field-type-select"
      value={value}
      onChange={(value) =>
        onChange?.({
          type: value,
          defaultValue: value === FieldMetadataType.Boolean ? false : undefined,
        })
      }
      options={fieldTypeOptions}
    />
  );
};
