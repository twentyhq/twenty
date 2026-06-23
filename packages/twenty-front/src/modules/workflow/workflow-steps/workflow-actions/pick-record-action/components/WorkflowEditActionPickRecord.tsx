import { styled } from '@linaria/react';
import { i18n } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { type SelectOption } from 'twenty-ui/input';
import { HorizontalSeparator } from 'twenty-ui/layout';
import { useDebouncedCallback } from 'use-debounce';

import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useObjectMetadataSelectHelpers } from '@/object-metadata/hooks/useObjectMetadataSelectHelpers';
import { isManyToOneRelationField } from '@/object-metadata/utils/isManyToOneRelationField';
import { FormMultiRecordPicker } from '@/object-record/record-field/ui/form-types/components/FormMultiRecordPicker';
import { InputHint } from '@/ui/input/components/InputHint';
import { Select } from '@/ui/input/components/Select';
import { SelectControl } from '@/ui/input/components/SelectControl';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { type WorkflowPickRecordAction } from '@/workflow/types/Workflow';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepFooter } from '@/workflow/workflow-steps/components/WorkflowStepFooter';
import { WorkflowObjectDropdownContent } from '@/workflow/workflow-steps/workflow-actions/find-records-action/components/WorkflowObjectDropdownContent';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledLabel = styled.span`
  color: ${themeCssVariables.font.color.light};
  display: block;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin-bottom: ${themeCssVariables.spacing[1]};
`;

const StyledObjectSelectContainer = styled.div`
  width: 100%;
`;

const defaultSelectedOptionMessage = msg`Select an option`;

type WorkflowEditActionPickRecordProps = {
  action: WorkflowPickRecordAction;
  actionOptions:
    | {
        readonly: true;
      }
    | {
        readonly?: false;
        onActionUpdate: (action: WorkflowPickRecordAction) => void;
      };
};

type PickRecordStrategy =
  WorkflowPickRecordAction['settings']['input']['strategy'];

type PickRecordLoadBalance =
  WorkflowPickRecordAction['settings']['input']['loadBalance'];

type PickRecordFormData = {
  objectNameSingular: string;
  strategy: PickRecordStrategy;
  recordIds: string[];
  loadBalance: PickRecordLoadBalance;
};

export const WorkflowEditActionPickRecord = ({
  action,
  actionOptions,
}: WorkflowEditActionPickRecordProps) => {
  const { t } = useLingui();
  const { getSelectIconPropsFromObjectMetadataItem } =
    useObjectMetadataSelectHelpers();

  const dropdownId = `workflow-edit-action-pick-record-object-name-${action.id}`;

  const { closeDropdown } = useCloseDropdown();

  const { objectMetadataItems } = useFilteredObjectMetadataItems();

  const [formData, setFormData] = useState<PickRecordFormData>(() => ({
    objectNameSingular: action.settings.input.objectName,
    strategy: action.settings.input.strategy,
    recordIds: action.settings.input.recordIds,
    loadBalance: action.settings.input.loadBalance,
  }));

  const isFormDisabled = actionOptions.readonly ?? false;

  const strategyOptions: SelectOption<PickRecordStrategy>[] = [
    { label: t`Random`, value: 'RANDOM' },
    { label: t`Round robin`, value: 'ROUND_ROBIN' },
    { label: t`Load balanced`, value: 'LOAD_BALANCED' },
  ];

  const loadBalanceObjectDropdownId = `workflow-edit-action-pick-record-load-balance-object-${action.id}`;

  const loadBalanceObjectMetadataItem = objectMetadataItems.find(
    (item) => item.nameSingular === formData.loadBalance?.objectNameSingular,
  );

  const loadBalanceObjectOption = loadBalanceObjectMetadataItem
    ? {
        label: loadBalanceObjectMetadataItem.labelPlural,
        value: loadBalanceObjectMetadataItem.nameSingular,
        ...getSelectIconPropsFromObjectMetadataItem(
          loadBalanceObjectMetadataItem,
        ),
      }
    : { label: i18n._(defaultSelectedOptionMessage), value: '' };

  const loadBalanceFieldOptions: SelectOption<string>[] = (
    loadBalanceObjectMetadataItem?.fields ?? []
  )
    .filter(
      (field) =>
        isManyToOneRelationField(field) &&
        field.relation?.targetObjectMetadata?.nameSingular ===
          formData.objectNameSingular,
    )
    .map((field) => ({ label: field.label, value: field.name }));

  const hasLoadBalanceFieldOptions = loadBalanceFieldOptions.length > 0;

  const selectedObjectMetadataItem = objectMetadataItems.find(
    (item) => item.nameSingular === formData.objectNameSingular,
  );

  const loadBalancePoolObjectLabel =
    selectedObjectMetadataItem?.labelSingular ?? t`the selected object`;

  const selectedOption = selectedObjectMetadataItem
    ? {
        label: selectedObjectMetadataItem.labelPlural,
        value: selectedObjectMetadataItem.nameSingular,
        ...getSelectIconPropsFromObjectMetadataItem(selectedObjectMetadataItem),
      }
    : { label: i18n._(defaultSelectedOptionMessage), value: '' };

  const saveAction = useDebouncedCallback(
    async (updatedFormData: PickRecordFormData) => {
      if (actionOptions.readonly === true) {
        return;
      }

      actionOptions.onActionUpdate({
        ...action,
        settings: {
          ...action.settings,
          input: {
            objectName: updatedFormData.objectNameSingular,
            strategy: updatedFormData.strategy,
            recordIds: updatedFormData.recordIds,
            loadBalance:
              updatedFormData.strategy === 'LOAD_BALANCED'
                ? updatedFormData.loadBalance
                : undefined,
          },
        },
      });
    },
    1_000,
  );

  useEffect(() => {
    return () => {
      saveAction.flush();
    };
  }, [saveAction]);

  const handleObjectChange = (value: string) => {
    if (actionOptions.readonly === true) {
      return;
    }

    const newFormData: PickRecordFormData = {
      ...formData,
      objectNameSingular: value,
      recordIds: [],
      loadBalance: isDefined(formData.loadBalance)
        ? { ...formData.loadBalance, fieldName: '' }
        : undefined,
    };

    setFormData(newFormData);
    saveAction(newFormData);
    closeDropdown(dropdownId);
  };

  const handleStrategyChange = (strategy: PickRecordStrategy) => {
    if (isFormDisabled === true) {
      return;
    }

    const newFormData: PickRecordFormData = {
      ...formData,
      strategy,
    };

    setFormData(newFormData);
    saveAction(newFormData);
  };

  const handleRecordIdsChange = (recordIds: string[]) => {
    if (isFormDisabled === true) {
      return;
    }

    const newFormData: PickRecordFormData = {
      ...formData,
      recordIds,
    };

    setFormData(newFormData);
    saveAction(newFormData);
  };

  const handleLoadBalanceObjectChange = (objectNameSingular: string) => {
    if (isFormDisabled === true) {
      return;
    }

    const newFormData: PickRecordFormData = {
      ...formData,
      loadBalance: { objectNameSingular, fieldName: '' },
    };

    setFormData(newFormData);
    saveAction(newFormData);
    closeDropdown(loadBalanceObjectDropdownId);
  };

  const handleLoadBalanceFieldChange = (fieldName: string) => {
    if (isFormDisabled === true || !isDefined(formData.loadBalance)) {
      return;
    }

    const newFormData: PickRecordFormData = {
      ...formData,
      loadBalance: { ...formData.loadBalance, fieldName },
    };

    setFormData(newFormData);
    saveAction(newFormData);
  };

  return (
    <>
      <WorkflowStepBody>
        <StyledObjectSelectContainer>
          <StyledLabel>{t`Object`}</StyledLabel>
          <Dropdown
            dropdownId={dropdownId}
            dropdownPlacement="bottom-start"
            clickableComponent={
              <SelectControl
                isDisabled={isFormDisabled}
                selectedOption={selectedOption}
              />
            }
            dropdownComponents={
              !isFormDisabled && (
                <WorkflowObjectDropdownContent
                  onOptionClick={handleObjectChange}
                />
              )
            }
            dropdownOffset={{ y: 4 }}
          />
        </StyledObjectSelectContainer>

        <Select
          dropdownId={`workflow-edit-action-pick-record-strategy-${action.id}`}
          label={t`Strategy`}
          fullWidth
          disabled={isFormDisabled}
          value={formData.strategy}
          options={strategyOptions}
          onChange={handleStrategyChange}
        />

        {formData.strategy === 'LOAD_BALANCED' && (
          <>
            <StyledObjectSelectContainer>
              <StyledLabel>{t`Balance by`}</StyledLabel>
              <Dropdown
                dropdownId={loadBalanceObjectDropdownId}
                dropdownPlacement="bottom-start"
                clickableComponent={
                  <SelectControl
                    isDisabled={isFormDisabled}
                    selectedOption={loadBalanceObjectOption}
                  />
                }
                dropdownComponents={
                  !isFormDisabled && (
                    <WorkflowObjectDropdownContent
                      onOptionClick={handleLoadBalanceObjectChange}
                    />
                  )
                }
                dropdownOffset={{ y: 4 }}
              />
            </StyledObjectSelectContainer>

            {isDefined(loadBalanceObjectMetadataItem) && (
              <StyledObjectSelectContainer>
                <Select
                  dropdownId={`workflow-edit-action-pick-record-load-balance-field-${action.id}`}
                  label={t`Count by`}
                  fullWidth
                  disabled={isFormDisabled || !hasLoadBalanceFieldOptions}
                  emptyOption={{
                    label: hasLoadBalanceFieldOptions
                      ? i18n._(defaultSelectedOptionMessage)
                      : t`No relation to count by`,
                    value: '',
                  }}
                  value={formData.loadBalance?.fieldName ?? ''}
                  options={loadBalanceFieldOptions}
                  onChange={handleLoadBalanceFieldChange}
                />
                {!hasLoadBalanceFieldOptions && (
                  <InputHint>
                    {t`${loadBalanceObjectMetadataItem.labelPlural} have no relation to ${loadBalancePoolObjectLabel}. Pick a different object to balance by.`}
                  </InputHint>
                )}
              </StyledObjectSelectContainer>
            )}
          </>
        )}

        <HorizontalSeparator noMargin />

        {isDefined(selectedObjectMetadataItem) && (
          <FormMultiRecordPicker
            key={selectedObjectMetadataItem.nameSingular}
            label={t`Pick from`}
            objectNameSingular={selectedObjectMetadataItem.nameSingular}
            defaultValue={formData.recordIds}
            onChange={(value) =>
              handleRecordIdsChange(Array.isArray(value) ? value : [])
            }
            readonly={isFormDisabled}
          />
        )}
      </WorkflowStepBody>
      {!actionOptions.readonly && <WorkflowStepFooter stepId={action.id} />}
    </>
  );
};
