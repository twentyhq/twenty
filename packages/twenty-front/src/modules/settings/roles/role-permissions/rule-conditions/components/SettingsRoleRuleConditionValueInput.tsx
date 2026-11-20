/* @license Enterprise */
import { isNonEmptyString } from '@sniptt/guards';

import { styled } from '@linaria/react';
import { useContext, useMemo } from 'react';
import {
  FieldMetadataType,
  RecordFilterOperand,
  StandardObjectNameSingular,
} from 'twenty-shared/types';
import {
  getFieldOrSubFieldType,
  isDefined,
  type RelativeDateFilter,
} from 'twenty-shared/utils';
import { IconEraser } from 'twenty-ui/icon';
import { Tooltip } from 'twenty-ui/primitives/surfaces';
import { type JsonValue } from 'type-fest';

import { useFieldMetadataItemById } from '@/object-metadata/hooks/useFieldMetadataItemById';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { formatFieldMetadataItemAsFieldDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsFieldDefinition';
import { AdvancedFilterContext } from '@/object-record/advanced-filter/states/context/AdvancedFilterContext';
import { useApplyObjectFilterDropdownFilterValue } from '@/object-record/object-filter-dropdown/hooks/useApplyObjectFilterDropdownFilterValue';
import { useUpsertObjectFilterDropdownCurrentFilter } from '@/object-record/object-filter-dropdown/hooks/useUpsertObjectFilterDropdownCurrentFilter';
import { configurableViewFilterOperands } from '@/object-record/object-filter-dropdown/utils/configurableViewFilterOperands';
import { getCompositeSubFieldLabel } from '@/object-record/object-filter-dropdown/utils/getCompositeSubFieldLabel';
import { isCompositeFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFieldType';
import { FormFieldInput } from '@/object-record/record-field/ui/components/FormFieldInput';
import { FormRelativeDatePicker } from '@/object-record/record-field/ui/form-types/components/FormRelativeDatePicker';
import { FormMultiSelectFieldInput } from '@/object-record/record-field/ui/form-types/components/FormMultiSelectFieldInput';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { type RLSDynamicValue } from '@/object-record/record-filter/types/RecordFilter';
import { isValidSubFieldName } from '@/settings/data-model/utils/isValidSubFieldName';
import { SettingsRoleRuleConditionVariablePicker } from '@/settings/roles/role-permissions/rule-conditions/components/SettingsRoleRuleConditionVariablePicker';
import { RuleConditionVariablePickerContext } from '@/settings/roles/role-permissions/rule-conditions/contexts/RuleConditionVariablePickerContext';
import { stringifyRelativeDateFilter } from '@/views/view-filter-value/utils/stringifyRelativeDateFilter';
import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';
import { useLingui } from '@lingui/react/macro';

const StyledContainer = styled.div`
  align-items: stretch;
  display: flex;
  flex: 3;
  flex-direction: row;
  max-width: 100%;
  min-width: 0;
`;

const StyledIconContainer = styled.div`
  align-items: center;
  background-color: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-bottom-right-radius: ${themeCssVariables.border.radius.sm};
  border-left: none;
  border-top-right-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.tertiary};
  cursor: pointer;
  display: flex;
  justify-content: center;
  padding: ${themeCssVariables.spacing[2]};

  &:hover {
    background-color: ${themeCssVariables.background.transparent.light};
  }
`;

const StyledReadOnlyInput = styled.div`
  align-items: center;
  background-color: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-bottom-left-radius: ${themeCssVariables.border.radius.sm};
  border-top-left-radius: ${themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  flex: 1;
  font-size: ${themeCssVariables.font.size.md};
  gap: ${themeCssVariables.spacing[1]};
  height: 32px;
  overflow: hidden;
  padding: ${themeCssVariables.spacing[2]};
`;

const StyledMeText = styled.span`
  color: ${themeCssVariables.color.blue};
  flex-shrink: 0;
`;

const StyledFieldLabel = styled.span`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledFormFieldInputWrapper = styled.div`
  display: flex;
  flex: 1;
  min-width: 0;
  overflow: visible;
`;

const StyledRelativeDateContainer = styled.div`
  display: flex;
  flex: 3;
  flex-direction: column;
  max-width: 100%;
  min-width: 0;
`;

const getConditionValueAsString = (value: JsonValue) => {
  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
    return JSON.stringify(value);
  }

  return String(value);
};

const getMultiSelectConditionValue = (value: string) => {
  if (!isNonEmptyString(value)) {
    return value;
  }

  try {
    return Array.isArray(JSON.parse(value)) ? value : JSON.stringify([value]);
  } catch {
    return JSON.stringify([value]);
  }
};

// "Is" on a date and time field compares a whole day, so its value is a plain date
const getConditionFieldType = ({
  fieldType,
  subFieldName,
  operand,
}: {
  fieldType: FieldMetadataType;
  subFieldName?: string | null;
  operand: RecordFilterOperand;
}) => {
  if (
    fieldType === FieldMetadataType.DATE_TIME &&
    operand === RecordFilterOperand.IS
  ) {
    return FieldMetadataType.DATE;
  }

  if (isCompositeFieldType(fieldType) && isDefined(subFieldName)) {
    return getFieldOrSubFieldType({ fieldType, subFieldName });
  }

  return fieldType;
};

type SettingsRoleRuleConditionValueInputProps = {
  recordFilterId: string;
};

export const SettingsRoleRuleConditionValueInput = ({
  recordFilterId,
}: SettingsRoleRuleConditionValueInputProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const { objectMetadataItem } = useContext(AdvancedFilterContext);

  const currentRecordFilters = useAtomComponentStateValue(
    currentRecordFiltersComponentState,
  );

  const recordFilter = currentRecordFilters.find(
    (filter) => filter.id === recordFilterId,
  );

  const { fieldMetadataItem } = useFieldMetadataItemById(
    recordFilter?.fieldMetadataId ?? '',
  );

  const { objectMetadataItem: workspaceMemberMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: StandardObjectNameSingular.WorkspaceMember,
    });

  const { upsertObjectFilterDropdownCurrentFilter } =
    useUpsertObjectFilterDropdownCurrentFilter();

  const { applyObjectFilterDropdownFilterValue } =
    useApplyObjectFilterDropdownFilterValue();

  const dynamicValue = recordFilter?.rlsDynamicValue;
  const isDynamicMode = isDefined(dynamicValue);

  const operandHasNoInput =
    isDefined(recordFilter) &&
    !configurableViewFilterOperands.has(recordFilter.operand);

  const workspaceMemberFieldLabel = useMemo(() => {
    if (!isDefined(dynamicValue)) {
      return null;
    }

    const workspaceMemberField = workspaceMemberMetadataItem?.fields.find(
      (field) => field.id === dynamicValue.workspaceMemberFieldMetadataId,
    );

    if (isDefined(workspaceMemberField)) {
      if (workspaceMemberField.name === 'id') {
        return null;
      }

      const baseLabel = workspaceMemberField.label;

      if (
        isDefined(dynamicValue.workspaceMemberSubFieldName) &&
        isValidSubFieldName(dynamicValue.workspaceMemberSubFieldName) &&
        isCompositeFieldType(workspaceMemberField.type)
      ) {
        const subFieldLabel = getCompositeSubFieldLabel(
          workspaceMemberField.type,
          dynamicValue.workspaceMemberSubFieldName,
        );

        return subFieldLabel ? `${baseLabel} / ${subFieldLabel}` : baseLabel;
      }

      return baseLabel;
    }

    return (
      dynamicValue.workspaceMemberSubFieldName ??
      dynamicValue.workspaceMemberFieldMetadataId
    );
  }, [dynamicValue, workspaceMemberMetadataItem?.fields]);

  const handleSelectDynamicValue = ({
    workspaceMemberFieldMetadataId,
    workspaceMemberSubFieldName,
  }: RLSDynamicValue) => {
    if (!isDefined(recordFilter)) {
      return;
    }

    const updatedFilter = {
      ...recordFilter,
      value: '',
      rlsDynamicValue: {
        workspaceMemberFieldMetadataId,
        workspaceMemberSubFieldName: workspaceMemberSubFieldName ?? null,
      },
    };

    upsertObjectFilterDropdownCurrentFilter(updatedFilter);
  };

  const handleResetToStaticValue = () => {
    if (!isDefined(recordFilter)) {
      return;
    }

    const updatedFilter = {
      ...recordFilter,
      rlsDynamicValue: null,
    };

    upsertObjectFilterDropdownCurrentFilter(updatedFilter);
  };

  if (isDynamicMode) {
    const tooltipId = `rule-condition-value-${recordFilterId}`;
    const fullLabel = isDefined(workspaceMemberFieldLabel)
      ? t`Me / ${workspaceMemberFieldLabel}`
      : t`Me`;

    return (
      <StyledContainer>
        <Tooltip
          content={fullLabel}
          delay={TooltipDelay.shortDelay}
          side="bottom"
          positionMethod="fixed"
        >
          <StyledReadOnlyInput id={tooltipId}>
            <StyledMeText>{t`Me`}</StyledMeText>
            {isDefined(workspaceMemberFieldLabel) && (
              <StyledFieldLabel>{` / ${workspaceMemberFieldLabel}`}</StyledFieldLabel>
            )}
          </StyledReadOnlyInput>
        </Tooltip>
        <StyledIconContainer
          onClick={handleResetToStaticValue}
          aria-label={t`Reset to static value`}
        >
          <IconEraser size={theme.icon.size.sm} />
        </StyledIconContainer>
      </StyledContainer>
    );
  }

  if (!isDefined(recordFilter) || !isDefined(fieldMetadataItem)) {
    return null;
  }

  if (operandHasNoInput) {
    return <StyledContainer />;
  }

  const handleChange = (value: JsonValue) => {
    applyObjectFilterDropdownFilterValue(getConditionValueAsString(value));
  };

  const isDateFilter =
    recordFilter.type === FieldMetadataType.DATE ||
    recordFilter.type === FieldMetadataType.DATE_TIME;

  if (
    isDateFilter &&
    recordFilter.operand === RecordFilterOperand.IS_RELATIVE
  ) {
    return (
      <StyledRelativeDateContainer>
        <FormRelativeDatePicker
          defaultValue={recordFilter.value}
          onChange={(relativeDateFilter: RelativeDateFilter) =>
            applyObjectFilterDropdownFilterValue(
              stringifyRelativeDateFilter(relativeDateFilter),
            )
          }
          isDateTimeField={recordFilter.type === FieldMetadataType.DATE_TIME}
        />
      </StyledRelativeDateContainer>
    );
  }

  const fieldDefinition = formatFieldMetadataItemAsFieldDefinition({
    field: { ...fieldMetadataItem, label: '' },
    objectMetadataItem: objectMetadataItem,
  });

  const conditionFieldType = getConditionFieldType({
    fieldType: fieldMetadataItem.type,
    subFieldName: recordFilter.subFieldName,
    operand: recordFilter.operand,
  });

  const isFilterableByMultiSelectValue =
    conditionFieldType === FieldMetadataType.MULTI_SELECT ||
    conditionFieldType === FieldMetadataType.SELECT;

  const getConditionInput = () => {
    if (isFilterableByMultiSelectValue) {
      return (
        <FormMultiSelectFieldInput
          label=""
          defaultValue={getMultiSelectConditionValue(recordFilter.value)}
          onChange={handleChange}
          options={fieldMetadataItem?.options ?? []}
          VariablePicker={SettingsRoleRuleConditionVariablePicker}
          dropdownWidth={200}
        />
      );
    }

    return (
      <FormFieldInput
        field={{ ...fieldDefinition, type: conditionFieldType }}
        defaultValue={recordFilter.value}
        onChange={handleChange}
        VariablePicker={SettingsRoleRuleConditionVariablePicker}
      />
    );
  };

  return (
    <StyledContainer>
      <RuleConditionVariablePickerContext.Provider
        value={{ recordFilterId, onSelect: handleSelectDynamicValue }}
      >
        <StyledFormFieldInputWrapper>
          {getConditionInput()}
        </StyledFormFieldInputWrapper>
      </RuleConditionVariablePickerContext.Provider>
    </StyledContainer>
  );
};
