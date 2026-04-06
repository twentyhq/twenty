import { useAICElement } from '@aicorg/sdk-react';
import { t } from '@lingui/core/macro';
import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { useClearField } from '@/object-record/record-field/ui/hooks/useClearField';
import { useAddSelectOption } from '@/object-record/record-field/ui/meta-types/hooks/useAddSelectOption';
import { useCanAddSelectOption } from '@/object-record/record-field/ui/meta-types/hooks/useCanAddSelectOption';
import { useFilteredSelectOptionsFromRLSPredicates } from '@/object-record/record-field/ui/meta-types/hooks/useFilteredSelectOptionsFromRLSPredicates';
import { useSelectField } from '@/object-record/record-field/ui/meta-types/hooks/useSelectField';
import { SELECT_FIELD_INPUT_SELECTABLE_LIST_COMPONENT_INSTANCE_ID } from '@/object-record/record-field/ui/meta-types/input/constants/SelectFieldInputSelectableListComponentInstanceId';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { SelectInput } from '@/ui/field/input/components/SelectInput';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { type HTMLAttributes } from 'react';
import { useContext, useState } from 'react';
import { Key } from 'ts-key-enum';
import { isDefined } from 'twenty-shared/utils';
import { type SelectOption } from 'twenty-ui/input';

export const SelectFieldInput = () => {
  const { fieldDefinition, fieldValue, recordId } = useSelectField();
  const { addSelectOption } = useAddSelectOption(
    fieldDefinition?.metadata?.fieldName,
  );
  const { canAddSelectOption } = useCanAddSelectOption(
    fieldDefinition?.metadata?.fieldName,
  );

  const { onCancel, onSubmit } = useContext(FieldInputEventContext);

  const { filteredOptions: selectOptions, canSelectEmpty } =
    useFilteredSelectOptionsFromRLSPredicates({
      fieldMetadataId: fieldDefinition.fieldMetadataId,
      objectMetadataNameSingular:
        fieldDefinition.metadata.objectMetadataNameSingular,
      options: fieldDefinition.metadata.options,
    });

  const instanceId = useAvailableComponentInstanceIdOrThrow(
    RecordFieldComponentInstanceContext,
  );

  const [filteredOptions, setFilteredOptions] = useState<SelectOption[]>([]);

  const { resetSelectedItem } = useSelectableList(
    SELECT_FIELD_INPUT_SELECTABLE_LIST_COMPONENT_INSTANCE_ID,
  );
  const clearField = useClearField();

  const selectedOption = selectOptions.find(
    (option) => option.value === fieldValue,
  );
  // handlers
  const handleClearField = () => {
    clearField();
    onCancel?.();
  };

  const handleAddSelectOption = (optionName: string) => {
    if (!canAddSelectOption) {
      return;
    }
    addSelectOption(optionName);
  };

  const handleSubmit = (option: SelectOption) => {
    onSubmit?.({ newValue: option.value });

    resetSelectedItem();
  };

  useHotkeysOnFocusedElement({
    keys: [Key.Escape],
    callback: () => {
      onCancel?.();
      resetSelectedItem();
    },
    focusId: instanceId,
    dependencies: [onCancel, resetSelectedItem],
  });

  const fieldLabel = fieldDefinition.label;
  const optionIds = [
    t`No ${fieldLabel}`,
    ...filteredOptions.map((option) => option.value),
  ];

  const editorMetadata = buildOpportunityStageSelectAICMetadata({
    recordId,
    fieldName: fieldDefinition.metadata.fieldName,
    objectNameSingular: fieldDefinition.metadata.objectMetadataNameSingular,
    fieldLabel,
    options: fieldDefinition.metadata.options,
  });

  const optionMetadataByValue = new Map(
    buildOpportunityStageOptionAICMetadata({
      recordId,
      fieldName: fieldDefinition.metadata.fieldName,
      objectNameSingular: fieldDefinition.metadata.objectMetadataNameSingular,
      fieldLabel,
      options: fieldDefinition.metadata.options,
    }).map((metadata) => [metadata.optionValue, metadata]),
  );

  return (
    <SelectFieldInputAICWrapper metadata={editorMetadata}>
      <SelectInput
        selectableListComponentInstanceId={
          SELECT_FIELD_INPUT_SELECTABLE_LIST_COMPONENT_INSTANCE_ID
        }
        selectableItemIdArray={optionIds}
        focusId={instanceId}
        onEnter={(itemId) => {
          const option = filteredOptions.find(
            (option) => option.value === itemId,
          );
          if (isDefined(option)) {
            handleSubmit(option);
          }
        }}
        onOptionSelected={handleSubmit}
        options={selectOptions}
        onCancel={onCancel}
        defaultOption={selectedOption}
        onFilterChange={setFilteredOptions}
        onClear={
          fieldDefinition.metadata.isNullable && canSelectEmpty
            ? handleClearField
            : undefined
        }
        clearLabel={fieldDefinition.label}
        onAddSelectOption={handleAddSelectOption}
        getOptionContainerProps={(option) => {
          const metadata = optionMetadataByValue.get(option.value);
          return metadata?.attributes;
        }}
      />
    </SelectFieldInputAICWrapper>
  );
};

const SelectFieldInputAICWrapper = ({
  metadata,
  children,
}: {
  metadata: ReturnType<typeof buildOpportunityStageSelectAICMetadata>;
  children: React.ReactNode;
}) => {
  if (!metadata) {
    return children;
  }

  const { attributes } = useAICElement(metadata, {
    defaultAction: 'edit',
    role: 'listbox',
  });

  return <div {...attributes}>{children}</div>;
};

const buildOpportunityStageSelectAICMetadata = ({
  recordId,
  fieldName,
  objectNameSingular,
  fieldLabel,
  options,
}: {
  recordId: string;
  fieldName: string;
  objectNameSingular: string;
  fieldLabel: string;
  options?: Array<{ label: string; value: string }>;
}) => {
  if (objectNameSingular !== 'opportunity' || fieldName !== 'stage') {
    return null;
  }

  const optionLabels = options?.map((option) => option.label).filter(Boolean);

  return {
    agentId: `opportunity.stage.select.${recordId}`,
    agentAction: 'edit' as const,
    agentDescription: optionLabels?.length
      ? `Choose a new stage for this exact opportunity. Available labels include: ${optionLabels.join(', ')}.`
      : 'Choose a new stage for this exact opportunity.',
    agentEntityId: recordId,
    agentEntityLabel: `Opportunity ${recordId}`,
    agentEntityType: 'opportunity',
    agentExecution: {
      settled_when: [
        'The updated stage label is visible on the opportunity record after the selector closes.',
      ],
    },
    agentLabel: fieldLabel,
    agentRecovery: {
      partial_state_changed: true,
      recovery:
        'If the new stage does not remain visible after the selector closes, reopen the same opportunity and verify the stage before retrying.',
      retryable: true,
    },
    agentRisk: 'medium' as const,
    agentWorkflowStep: 'opportunity.stage.select_value',
  };
};

const buildOpportunityStageOptionAICMetadata = ({
  recordId,
  fieldName,
  objectNameSingular,
  fieldLabel,
  options,
}: {
  recordId: string;
  fieldName: string;
  objectNameSingular: string;
  fieldLabel: string;
  options?: Array<{ label: string; value: string }>;
}) => {
  if (objectNameSingular !== 'opportunity' || fieldName !== 'stage') {
    return [];
  }

  return (
    options?.map((option) => ({
      optionValue: option.value,
      attributes: {
        'data-agent-id': `opportunity.stage.option.${recordId}.${option.value}`,
        'data-agent-action': 'edit',
        'data-agent-description': `Select the ${option.label} stage for this exact opportunity.`,
        'data-agent-entity-id': recordId,
        'data-agent-entity-label': `Opportunity ${recordId}`,
        'data-agent-entity-type': 'opportunity',
        'data-agent-label': `${fieldLabel} ${option.label}`,
        'data-agent-risk': 'medium',
        'data-agent-workflow': 'opportunity.stage.select_value',
      } satisfies HTMLAttributes<HTMLDivElement>,
    })) ?? []
  );
};
