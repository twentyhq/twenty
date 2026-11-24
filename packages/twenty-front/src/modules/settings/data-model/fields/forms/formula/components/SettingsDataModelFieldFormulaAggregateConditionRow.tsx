import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { ViewFilterOperand } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconTrash } from 'twenty-ui/icon';
import { useIcons } from 'twenty-ui/icon/provider';
import { themeCssVariables } from 'twenty-ui/theme';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getOperandLabel } from '@/object-record/object-filter-dropdown/utils/getOperandLabel';
import { SettingsDataModelFieldFormulaAggregateConditionValueInput } from '@/settings/data-model/fields/forms/formula/components/SettingsDataModelFieldFormulaAggregateConditionValueInput';
import { FORMULA_AGGREGATE_CONDITION_OPERANDS_BY_FIELD_METADATA_TYPE } from '@/settings/data-model/fields/forms/formula/constants/FormulaAggregateConditionOperandsByFieldMetadataType';
import { type FormulaAggregateCondition } from '@/settings/data-model/fields/forms/formula/types/FormulaAggregateCondition';
import { getFormulaAggregateConditionForFieldMetadataItem } from '@/settings/data-model/fields/forms/formula/utils/getFormulaAggregateConditionForFieldMetadataItem';
import { Select } from '@/ui/input/components/Select';

const StyledRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledCell = styled.div`
  flex: 1;
  min-width: 0;
`;

const OPERANDS_WITHOUT_VALUE = [
  ViewFilterOperand.IS_EMPTY,
  ViewFilterOperand.IS_NOT_EMPTY,
];

type SettingsDataModelFieldFormulaAggregateConditionRowProps = {
  condition: FormulaAggregateCondition;
  filterableFieldMetadataItems: FieldMetadataItem[];
  onChange: (condition: FormulaAggregateCondition) => void;
  onRemove: () => void;
};

export const SettingsDataModelFieldFormulaAggregateConditionRow = ({
  condition,
  filterableFieldMetadataItems,
  onChange,
  onRemove,
}: SettingsDataModelFieldFormulaAggregateConditionRowProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const fieldMetadataItem = filterableFieldMetadataItems.find(
    ({ name }) => name === condition.fieldName,
  );
  const operands = isDefined(fieldMetadataItem)
    ? (FORMULA_AGGREGATE_CONDITION_OPERANDS_BY_FIELD_METADATA_TYPE[
        fieldMetadataItem.type
      ] ?? [])
    : [];

  return (
    <StyledRow>
      <StyledCell>
        <Select<string>
          dropdownId={`formula-aggregate-condition-field-${condition.id}`}
          selectSizeVariant="small"
          fullWidth
          needIconCheck={false}
          value={condition.fieldName}
          onChange={(fieldName) => {
            const selectedFieldMetadataItem = filterableFieldMetadataItems.find(
              ({ name }) => name === fieldName,
            );

            if (isDefined(selectedFieldMetadataItem)) {
              onChange(
                getFormulaAggregateConditionForFieldMetadataItem({
                  conditionId: condition.id,
                  fieldMetadataItem: selectedFieldMetadataItem,
                }),
              );
            }
          }}
          options={filterableFieldMetadataItems.map((field) => ({
            Icon: getIcon(field.icon),
            label: field.label,
            value: field.name,
          }))}
        />
      </StyledCell>
      <StyledCell>
        <Select<ViewFilterOperand>
          dropdownId={`formula-aggregate-condition-operand-${condition.id}`}
          selectSizeVariant="small"
          fullWidth
          needIconCheck={false}
          value={condition.operand}
          onChange={(operand) => onChange({ ...condition, operand })}
          options={operands.map((operand) => ({
            label: getOperandLabel(operand),
            value: operand,
          }))}
        />
      </StyledCell>
      <StyledCell>
        {isDefined(fieldMetadataItem) &&
          !OPERANDS_WITHOUT_VALUE.includes(condition.operand) && (
            <SettingsDataModelFieldFormulaAggregateConditionValueInput
              condition={condition}
              fieldMetadataItem={fieldMetadataItem}
              onChange={(value) => onChange({ ...condition, value })}
            />
          )}
      </StyledCell>
      <LightIconButton
        emphasis="subtle"
        aria-label={t`Remove condition`}
        onClick={onRemove}
      >
        <IconTrash />
      </LightIconButton>
    </StyledRow>
  );
};
