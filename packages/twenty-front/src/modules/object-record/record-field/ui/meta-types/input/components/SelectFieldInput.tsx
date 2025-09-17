import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { useClearField } from '@/object-record/record-field/ui/hooks/useClearField';
import { useSelectField } from '@/object-record/record-field/ui/meta-types/hooks/useSelectField';
import { SELECT_FIELD_INPUT_SELECTABLE_LIST_COMPONENT_INSTANCE_ID } from '@/object-record/record-field/ui/meta-types/input/constants/SelectFieldInputSelectableListComponentInstanceId';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { SelectInput } from '@/ui/field/input/components/SelectInput';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { navigationMemorizedUrlState } from '@/ui/navigation/states/navigationMemorizedUrlState';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useCallback, useContext, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { Key } from 'ts-key-enum';
import { SettingsPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type SelectOption } from 'twenty-ui/input';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const SelectFieldInput = () => {
  const { fieldDefinition, fieldValue } = useSelectField();
  const { objectNamePlural } = useParams();
  const navigateSettings = useNavigateSettings();
  const setNavigationMemorizedUrl = useSetRecoilState(
    navigationMemorizedUrlState,
  );

  const { onCancel, onSubmit } = useContext(FieldInputEventContext);

  const instanceId = useAvailableComponentInstanceIdOrThrow(
    RecordFieldComponentInstanceContext,
  );

  const [filteredOptions, setFilteredOptions] = useState<SelectOption[]>([]);

  const { resetSelectedItem } = useSelectableList(
    SELECT_FIELD_INPUT_SELECTABLE_LIST_COMPONENT_INSTANCE_ID,
  );
  const clearField = useClearField();

  const handleAddSelectOption = useCallback(
    (optionName: string) => {
      if (!fieldDefinition?.metadata?.fieldName || !objectNamePlural) return;

      setNavigationMemorizedUrl({
        url: window.location.pathname + window.location.search,
        isAddingFieldOption: true,
      });

      navigateSettings(
        SettingsPath.ObjectFieldEdit,
        { objectNamePlural, fieldName: fieldDefinition.metadata.fieldName },
        undefined,
        { state: { createNewOption: optionName } },
      );
    },
    [
      fieldDefinition,
      objectNamePlural,
      navigateSettings,
      setNavigationMemorizedUrl,
    ],
  );

  const selectedOption = fieldDefinition.metadata.options.find(
    (option) => option.value === fieldValue,
  );
  // handlers
  const handleClearField = () => {
    clearField();
    onCancel?.();
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

  const optionIds = [
    `No ${fieldDefinition.label}`,
    ...filteredOptions.map((option) => option.value),
  ];

  return (
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
      options={fieldDefinition.metadata.options}
      onCancel={onCancel}
      defaultOption={selectedOption}
      onFilterChange={setFilteredOptions}
      onClear={
        fieldDefinition.metadata.isNullable ? handleClearField : undefined
      }
      clearLabel={fieldDefinition.label}
      onAddSelectOption={handleAddSelectOption}
    />
  );
};
