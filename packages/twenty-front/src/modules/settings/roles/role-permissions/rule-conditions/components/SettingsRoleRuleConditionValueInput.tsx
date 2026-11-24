/* @license Enterprise */
import { isNonEmptyString, isObject, isString } from '@sniptt/guards';

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
import { FormFieldInputInnerContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputInnerContainer';
import { FormFieldInputRowContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputRowContainer';
import { FormRelativeDatePicker } from '@/object-record/record-field/ui/form-types/components/FormRelativeDatePicker';
import { FormMultiSelectFieldInput } from '@/object-record/record-field/ui/form-types/components/FormMultiSelectFieldInput';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { type RLSDynamicValue } from '@/object-record/record-filter/types/RecordFilter';
import { isValidSubFieldName } from '@/settings/data-model/utils/isValidSubFieldName';
import { SettingsRoleRuleConditionVariablePicker } from '@/settings/roles/role-permissions/rule-conditions/components/SettingsRoleRuleConditionVariablePicker';
import { RuleConditionVariablePickerContext } from '@/settings/roles/role-permissions/rule-conditions/contexts/RuleConditionVariablePickerContext';
import { BaseChip } from '@/ui/input/components/BaseChip';
import { FormFieldInputContainer } from '@/ui/input/components/FormFieldInputContainer';
import { stringifyRelativeDateFilter } from '@/views/view-filter-value/utils/stringifyRelativeDateFilter';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { themeCssVariables } from 'twenty-ui/theme';
import { useLingui } from '@lingui/react/macro';

const StyledContainer = styled.div`
  align-items: stretch;
  display: flex;
  flex: 3;
  flex-direction: row;
  max-width: 100%;
  min-width: 0;
`;

const StyledChipContainer = styled.div`
  align-items: center;
  display: flex;
  margin-left: ${themeCssVariables.spacing[2]};
  min-width: 0;
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
  if (isString(value)) {
    return value;
  }

  if (Array.isArray(value) || isObject(value)) {
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
    const meLabel = isDefined(workspaceMemberFieldLabel)
      ? t`Me / ${workspaceMemberFieldLabel}`
      : t`Me`;
    const instanceId = `rule-condition-value-${recordFilterId}`;

    return (
      <StyledContainer>
        <RuleConditionVariablePickerContext.Provider
          value={{ recordFilterId, onSelect: handleSelectDynamicValue }}
        >
          <StyledFormFieldInputWrapper>
            <FormFieldInputContainer>
              <FormFieldInputRowContainer>
                <FormFieldInputInnerContainer
                  formFieldInputInstanceId={instanceId}
                  hasRightElement
                >
                  <StyledChipContainer>
                    <BaseChip
                      label={meLabel}
                      onRemove={handleResetToStaticValue}
                      removeAriaLabel={t`Remove Me value`}
                    />
                  </StyledChipContainer>
                </FormFieldInputInnerContainer>
                <SettingsRoleRuleConditionVariablePicker
                  instanceId={instanceId}
                />
              </FormFieldInputRowContainer>
            </FormFieldInputContainer>
          </StyledFormFieldInputWrapper>
        </RuleConditionVariablePickerContext.Provider>
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
          dropdownWidth={GenericDropdownContentWidth.Medium}
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
