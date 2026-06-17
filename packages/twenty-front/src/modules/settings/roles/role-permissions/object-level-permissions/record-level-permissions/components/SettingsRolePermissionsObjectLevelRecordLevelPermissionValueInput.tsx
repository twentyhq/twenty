/* @license Enterprise */

import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useContext, useMemo } from 'react';
import { FieldMetadataType, CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { AppTooltip, IconEraser, TooltipDelay } from 'twenty-ui/display';
import { type JsonValue } from 'type-fest';

import { useFieldMetadataItemById } from '@/object-metadata/hooks/useFieldMetadataItemById';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { formatFieldMetadataItemAsFieldDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsFieldDefinition';
import { AdvancedFilterContext } from '@/object-record/advanced-filter/states/context/AdvancedFilterContext';
import { useApplyObjectFilterDropdownFilterValue } from '@/object-record/object-filter-dropdown/hooks/useApplyObjectFilterDropdownFilterValue';
import { useUpsertObjectFilterDropdownCurrentFilter } from '@/object-record/object-filter-dropdown/hooks/useUpsertObjectFilterDropdownCurrentFilter';
import { configurableViewFilterOperands } from '@/object-record/object-filter-dropdown/utils/configurableViewFilterOperands';
import { getCompositeSubFieldLabel } from '@/object-record/object-filter-dropdown/utils/getCompositeSubFieldLabel';
import { getCompositeSubFieldType } from '@/object-record/object-filter-dropdown/utils/getCompositeSubFieldType';
import { isCompositeFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFieldType';
import { FormFieldInput } from '@/object-record/record-field/ui/components/FormFieldInput';
import { FormMultiSelectFieldInput } from '@/object-record/record-field/ui/form-types/components/FormMultiSelectFieldInput';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { type CompositeFieldType } from '@/settings/data-model/types/CompositeFieldType';
import { createRecordLevelPermissionVariablePicker } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/components/SettingsRolePermissionsObjectLevelRecordLevelPermissionVariablePicker';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

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

type SettingsRolePermissionsObjectLevelRecordLevelPermissionValueInputProps = {
  recordFilterId: string;
};

export const SettingsRolePermissionsObjectLevelRecordLevelPermissionValueInput =
  ({
    recordFilterId,
  }: SettingsRolePermissionsObjectLevelRecordLevelPermissionValueInputProps) => {
    const { theme } = useContext(ThemeContext);
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
        objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
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
      if (!dynamicValue) {
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
          isCompositeFieldType(workspaceMemberField.type)
        ) {
          const subFieldLabel = getCompositeSubFieldLabel(
            workspaceMemberField.type as CompositeFieldType,
            dynamicValue.workspaceMemberSubFieldName as any,
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

    const handleSelectDynamicValue = (
      workspaceMemberFieldMetadataId: string,
      workspaceMemberSubFieldName?: string | null,
    ) => {
      if (!recordFilter) {
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
      if (!recordFilter) {
        return;
      }

      const updatedFilter = {
        ...recordFilter,
        rlsDynamicValue: null,
      };

      upsertObjectFilterDropdownCurrentFilter(updatedFilter);
    };

    if (isDynamicMode) {
      const tooltipId = `record-level-permission-value-${recordFilterId}`;
      const fullLabel = isDefined(workspaceMemberFieldLabel)
        ? `Me / ${workspaceMemberFieldLabel}`
        : 'Me';

      return (
        <>
          <StyledContainer>
            <StyledReadOnlyInput id={tooltipId}>
              <StyledMeText>{t`Me`}</StyledMeText>
              {isDefined(workspaceMemberFieldLabel) && (
                <StyledFieldLabel>{` / ${workspaceMemberFieldLabel}`}</StyledFieldLabel>
              )}
            </StyledReadOnlyInput>
            <StyledIconContainer
              onClick={handleResetToStaticValue}
              aria-label={t`Reset to static value`}
            >
              <IconEraser size={theme.icon.size.sm} />
            </StyledIconContainer>
          </StyledContainer>
          <AppTooltip
            anchorSelect={`#${tooltipId}`}
            content={fullLabel}
            delay={TooltipDelay.shortDelay}
            noArrow
            place="bottom"
            positionStrategy="fixed"
          />
        </>
      );
    }

    if (!isDefined(recordFilter) || !isDefined(fieldMetadataItem)) {
      return null;
    }

    if (operandHasNoInput) {
      return <StyledContainer />;
    }

    const handleChange = (value: JsonValue) => {
      const valueToUpsert =
        typeof value === 'string'
          ? value
          : Array.isArray(value) ||
              (typeof value === 'object' && value !== null)
            ? JSON.stringify(value)
            : String(value);

      applyObjectFilterDropdownFilterValue(valueToUpsert);
    };

    const RecordLevelPermissionPicker =
      createRecordLevelPermissionVariablePicker(
        recordFilterId,
        handleSelectDynamicValue,
      );

    let fieldDefinition = formatFieldMetadataItemAsFieldDefinition({
      field: {
        ...fieldMetadataItem,
        label: undefined as unknown as string,
      },
      objectMetadataItem: objectMetadataItem,
    });

    const isComposite = isCompositeFieldType(recordFilter.type);

    if (isComposite && isDefined(recordFilter.subFieldName)) {
      const subFieldType = getCompositeSubFieldType(
        fieldMetadataItem,
        recordFilter.subFieldName,
      );

      if (isDefined(subFieldType)) {
        fieldDefinition = {
          ...fieldDefinition,
          type: subFieldType,
        };
      }
    }

    const isFilterableByMultiSelectValue =
      fieldDefinition.type === FieldMetadataType.MULTI_SELECT ||
      fieldDefinition.type === FieldMetadataType.SELECT;

    if (isFilterableByMultiSelectValue) {
      let formattedValue = recordFilter.value;

      if (isDefined(formattedValue) && formattedValue !== '') {
        try {
          const parsed = JSON.parse(formattedValue);
          if (!Array.isArray(parsed)) {
            formattedValue = JSON.stringify([formattedValue]);
          }
        } catch {
          formattedValue = JSON.stringify([formattedValue]);
        }
      }

      return (
        <StyledContainer>
          <StyledFormFieldInputWrapper>
            <FormMultiSelectFieldInput
              label=""
              defaultValue={formattedValue}
              onChange={handleChange}
              options={fieldMetadataItem?.options ?? []}
              VariablePicker={RecordLevelPermissionPicker}
              dropdownWidth={200}
            />
          </StyledFormFieldInputWrapper>
        </StyledContainer>
      );
    }

    return (
      <StyledContainer>
        <StyledFormFieldInputWrapper>
          <FormFieldInput
            field={fieldDefinition}
            defaultValue={recordFilter.value}
            onChange={handleChange}
            VariablePicker={RecordLevelPermissionPicker}
          />
        </StyledFormFieldInputWrapper>
      </StyledContainer>
    );
  };
