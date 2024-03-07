import { SETTINGS_FIELD_METADATA_TYPES } from '@/settings/data-model/constants/SettingsFieldMetadataTypes';
import { Select, SelectOption } from '@/ui/input/components/Select';
import { FieldMetadataType } from '~/generated-metadata/graphql';

type SettingsDataModelFieldTypeSelectProps = {
  className?: string;
  disabled?: boolean;
  excludedFieldTypes?: FieldMetadataType[];
  onChange?: ({ type }: { type: FieldMetadataType }) => void;
  value?: FieldMetadataType;
};

export const SettingsDataModelFieldTypeSelect = ({
  className,
  disabled,
  excludedFieldTypes,
  onChange,
  value,
}: SettingsDataModelFieldTypeSelectProps) => {
  const fieldTypeOptions = Object.entries(SETTINGS_FIELD_METADATA_TYPES)
    .filter(([key]) => !excludedFieldTypes?.includes(key as FieldMetadataType))
    .map<SelectOption<FieldMetadataType>>(([key, dataTypeConfig]) => ({
      Icon: dataTypeConfig.Icon,
      label: dataTypeConfig.label,
      value: key as FieldMetadataType,
    }));

  return (
    <Select
      className={className}
      fullWidth
      disabled={disabled}
      dropdownId="object-field-type-select"
      value={value}
      onChange={(value) => onChange?.({ type: value })}
      options={fieldTypeOptions}
    />
  );
};
