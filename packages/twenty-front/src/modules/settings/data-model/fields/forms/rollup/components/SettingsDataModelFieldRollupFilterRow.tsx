import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getOperandLabel } from '@/object-record/object-filter-dropdown/utils/getOperandLabel';
import { SettingsDataModelFieldRollupFilterValueInput } from '@/settings/data-model/fields/forms/rollup/components/SettingsDataModelFieldRollupFilterValueInput';
import { ROLLUP_FILTER_OPERANDS_BY_FIELD_METADATA_TYPE } from '@/settings/data-model/fields/forms/rollup/constants/RollupFilterOperandsByFieldMetadataType';
import { type RollupSettingsFormFilter } from '@/settings/data-model/fields/forms/rollup/types/RollupSettingsFormFilter';
import { getRollupFilterForFieldMetadataItem } from '@/settings/data-model/fields/forms/rollup/utils/getRollupFilterForFieldMetadataItem';
import { Select } from '@/ui/input/components/Select';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ViewFilterOperand } from 'twenty-shared/types';
import { getFieldMetadataValueType, isDefined } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconTrash } from 'twenty-ui/icon';
import { useIcons } from 'twenty-ui/icon/provider';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledRow = styled.div`
  align-items: center;
  background-color: ${themeCssVariables.background.secondary};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[4]};
`;

const StyledValue = styled.div`
  flex: 1;
  min-width: 0;
`;

type SettingsDataModelFieldRollupFilterRowProps = {
  filter: RollupSettingsFormFilter;
  filterableFieldMetadataItems: FieldMetadataItem[];
  disabled?: boolean;
  onChange: (filter: RollupSettingsFormFilter) => void;
  onRemove: () => void;
};

export const SettingsDataModelFieldRollupFilterRow = ({
  filter,
  filterableFieldMetadataItems,
  disabled,
  onChange,
  onRemove,
}: SettingsDataModelFieldRollupFilterRowProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const fieldMetadataItem = filterableFieldMetadataItems.find(
    ({ id }) => id === filter.fieldMetadataId,
  );
  const operands = isDefined(fieldMetadataItem)
    ? (ROLLUP_FILTER_OPERANDS_BY_FIELD_METADATA_TYPE[
        getFieldMetadataValueType(fieldMetadataItem)
      ] ?? [])
    : [];

  return (
    <StyledRow>
      <Select<string>
        dropdownId={`rollup-filter-field-${filter.id}`}
        selectSizeVariant="small"
        dropdownWidth={200}
        needIconCheck={false}
        disabled={disabled}
        value={filter.fieldMetadataId}
        onChange={(fieldMetadataId) => {
          const selectedFieldMetadataItem = filterableFieldMetadataItems.find(
            ({ id }) => id === fieldMetadataId,
          );

          if (isDefined(selectedFieldMetadataItem)) {
            onChange(
              getRollupFilterForFieldMetadataItem({
                filterId: filter.id,
                fieldMetadataItem: selectedFieldMetadataItem,
              }),
            );
          }
        }}
        options={filterableFieldMetadataItems.map((field) => ({
          Icon: getIcon(field.icon),
          label: field.label,
          value: field.id,
        }))}
      />
      <Select<ViewFilterOperand>
        dropdownId={`rollup-filter-operand-${filter.id}`}
        selectSizeVariant="small"
        dropdownWidth={160}
        needIconCheck={false}
        disabled={disabled}
        value={filter.operand}
        onChange={(operand) => onChange({ ...filter, operand })}
        options={operands.map((operand) => ({
          label: getOperandLabel(operand),
          value: operand,
        }))}
      />
      <StyledValue>
        {isDefined(fieldMetadataItem) && (
          <SettingsDataModelFieldRollupFilterValueInput
            filter={filter}
            fieldMetadataItem={fieldMetadataItem}
            disabled={disabled}
            onChange={(value) => onChange({ ...filter, value })}
          />
        )}
      </StyledValue>
      <LightIconButton
        emphasis="subtle"
        aria-label={t`Remove filter`}
        disabled={disabled}
        onClick={onRemove}
      >
        <IconTrash />
      </LightIconButton>
    </StyledRow>
  );
};
