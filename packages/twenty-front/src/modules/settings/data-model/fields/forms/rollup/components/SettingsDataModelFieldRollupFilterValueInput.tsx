import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type RollupSettingsFormFilter } from '@/settings/data-model/fields/forms/rollup/types/RollupSettingsFormFilter';
import { Select } from '@/ui/input/components/Select';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { useLingui } from '@lingui/react/macro';
import { FieldMetadataType } from 'twenty-shared/types';
import {
  convertViewFilterValueToString,
  getFieldMetadataValueType,
  parseJson,
} from 'twenty-shared/utils';

type SettingsDataModelFieldRollupFilterValueInputProps = {
  filter: Pick<RollupSettingsFormFilter, 'id' | 'value'>;
  fieldMetadataItem: FieldMetadataItem;
  disabled?: boolean;
  onChange: (value: string) => void;
};

export const SettingsDataModelFieldRollupFilterValueInput = ({
  filter,
  fieldMetadataItem,
  disabled,
  onChange,
}: SettingsDataModelFieldRollupFilterValueInputProps) => {
  const { t } = useLingui();
  const fieldType = getFieldMetadataValueType(fieldMetadataItem);
  const valueAsString = convertViewFilterValueToString(filter.value);

  if (fieldType === FieldMetadataType.BOOLEAN) {
    return (
      <Select<string>
        dropdownId={`rollup-filter-value-${filter.id}`}
        selectSizeVariant="small"
        dropdownWidth={120}
        needIconCheck={false}
        disabled={disabled}
        value={valueAsString}
        onChange={onChange}
        options={[
          { label: t`True`, value: 'true' },
          { label: t`False`, value: 'false' },
        ]}
      />
    );
  }

  if (
    fieldType === FieldMetadataType.SELECT ||
    fieldType === FieldMetadataType.MULTI_SELECT
  ) {
    const [selectedOptionValue = ''] = parseJson<string[]>(valueAsString) ?? [];

    return (
      <Select<string>
        dropdownId={`rollup-filter-value-${filter.id}`}
        selectSizeVariant="small"
        dropdownWidth={160}
        needIconCheck={false}
        disabled={disabled}
        value={selectedOptionValue}
        onChange={(optionValue) => onChange(JSON.stringify([optionValue]))}
        options={(fieldMetadataItem.options ?? []).map((option) => ({
          label: option.label,
          value: option.value,
        }))}
      />
    );
  }

  return (
    <SettingsTextInput
      instanceId={`rollup-filter-value-${filter.id}`}
      sizeVariant="sm"
      type={fieldType === FieldMetadataType.NUMBER ? 'number' : 'text'}
      placeholder={t`Value`}
      disabled={disabled}
      value={valueAsString}
      onChange={onChange}
    />
  );
};
