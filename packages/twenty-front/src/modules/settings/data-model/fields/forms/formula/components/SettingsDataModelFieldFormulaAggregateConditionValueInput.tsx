import { useLingui } from '@lingui/react/macro';
import { FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type FormulaAggregateCondition } from '@/settings/data-model/fields/forms/formula/types/FormulaAggregateCondition';
import { Select } from '@/ui/input/components/Select';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';

type SettingsDataModelFieldFormulaAggregateConditionValueInputProps = {
  condition: Pick<FormulaAggregateCondition, 'id' | 'value'>;
  fieldMetadataItem: Pick<FieldMetadataItem, 'type' | 'options'>;
  onChange: (value: string) => void;
};

export const SettingsDataModelFieldFormulaAggregateConditionValueInput = ({
  condition,
  fieldMetadataItem,
  onChange,
}: SettingsDataModelFieldFormulaAggregateConditionValueInputProps) => {
  const { t } = useLingui();
  const dropdownId = `formula-aggregate-condition-value-${condition.id}`;

  if (fieldMetadataItem.type === FieldMetadataType.BOOLEAN) {
    return (
      <Select<string>
        dropdownId={dropdownId}
        selectSizeVariant="small"
        fullWidth
        needIconCheck={false}
        value={condition.value}
        onChange={onChange}
        options={[
          { label: t`True`, value: 'true' },
          { label: t`False`, value: 'false' },
        ]}
      />
    );
  }

  if (
    fieldMetadataItem.type === FieldMetadataType.SELECT ||
    fieldMetadataItem.type === FieldMetadataType.MULTI_SELECT
  ) {
    return (
      <Select<string>
        dropdownId={dropdownId}
        selectSizeVariant="small"
        fullWidth
        needIconCheck={false}
        value={condition.value}
        onChange={onChange}
        options={(fieldMetadataItem.options ?? []).map((option) => ({
          label: option.label,
          value: option.value,
        }))}
      />
    );
  }

  return (
    <SettingsTextInput
      instanceId={dropdownId}
      sizeVariant="sm"
      fullWidth
      type={
        fieldMetadataItem.type === FieldMetadataType.NUMBER ? 'number' : 'text'
      }
      placeholder={t`Value`}
      value={condition.value}
      onChange={onChange}
    />
  );
};
