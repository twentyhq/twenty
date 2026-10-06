import { InputHint } from '@/ui/input/components/internal/InputHint/InputHint';
import { styled } from '@linaria/react';
import { i18n } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { type SelectOption } from 'twenty-ui/primitives/input';
import { Separator } from 'twenty-ui/primitives/layout';
import { useDebouncedCallback } from 'use-debounce';

import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { isManyToOneRelationField } from '@/object-metadata/utils/isManyToOneRelationField';
import { FormMultiRecordPicker } from '@/object-record/record-field/ui/form-types/components/FormMultiRecordPicker';
import { Select } from '@/ui/input/components/Select';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useWorkflowObjectSelectOptions } from '@/workflow/hooks/useWorkflowObjectSelectOptions';
import { type WorkflowPickRecordAction } from '@/workflow/types/Workflow';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepFooter } from '@/workflow/workflow-steps/components/WorkflowStepFooter';

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

  const dropdownId = `workflow-edit-action-pick-record-object-name-${action.id}`;

  const { objectMetadataItems } = useFilteredObjectMetadataItems();

  const [formData, setFormData] = useState<PickRecordFormData>(() => ({
    objectNameSingular: action.settings.input.objectName,
    strategy: action.settings.input.strategy,
    recordIds: action.settings.input.recordIds,
    loadBalance: action.settings.input.loadBalance,
  }));

  const isFormDisabled = actionOptions.readonly ?? false;
  const objectOptions = useWorkflowObjectSelectOptions({
    selectedObjectNameSingular: formData.objectNameSingular,
  });
  const loadBalanceObjectOptions = useWorkflowObjectSelectOptions({
    selectedObjectNameSingular: formData.loadBalance?.objectNameSingular,
  });

  const strategyOptions: SelectOption<PickRecordStrategy>[] = [
    { label: t`Random`, value: 'RANDOM' },
    { label: t`Round robin`, value: 'ROUND_ROBIN' },
    { label: t`Load balanced`, value: 'LOAD_BALANCED' },
  ];

  const loadBalanceObjectDropdownId = `workflow-edit-action-pick-record-load-balance-object-${action.id}`;

  const loadBalanceObjectMetadataItem = objectMetadataItems.find(
    (item) => item.nameSingular === formData.loadBalance?.objectNameSingular,
  );

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
        <Select
          dropdownId={dropdownId}
          label={t`Object`}
          fullWidth
          disabled={isFormDisabled}
          value={formData.objectNameSingular}
          emptyOption={{
            label: i18n._(defaultSelectedOptionMessage),
            value: '',
          }}
          options={objectOptions}
          onChange={handleObjectChange}
          withSearchInput
          dropdownSideOffset={4}
          dropdownWidth={GenericDropdownContentWidth.ExtraLarge}
        />

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
            <Select
              dropdownId={loadBalanceObjectDropdownId}
              label={t`Balance by`}
              fullWidth
              disabled={isFormDisabled}
              value={formData.loadBalance?.objectNameSingular ?? ''}
              emptyOption={{
                label: i18n._(defaultSelectedOptionMessage),
                value: '',
              }}
              options={loadBalanceObjectOptions}
              onChange={handleLoadBalanceObjectChange}
              withSearchInput
              dropdownSideOffset={4}
              dropdownWidth={GenericDropdownContentWidth.ExtraLarge}
            />

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

        <Separator style={{ margin: 0 }} />

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
