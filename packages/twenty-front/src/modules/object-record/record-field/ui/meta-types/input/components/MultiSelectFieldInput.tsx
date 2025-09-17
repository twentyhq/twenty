import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { useMultiSelectField } from '@/object-record/record-field/ui/meta-types/hooks/useMultiSelectField';
import { SELECT_FIELD_INPUT_SELECTABLE_LIST_COMPONENT_INSTANCE_ID } from '@/object-record/record-field/ui/meta-types/input/constants/SelectFieldInputSelectableListComponentInstanceId';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { type FieldMultiSelectValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { MultiSelectInput } from '@/ui/field/input/components/MultiSelectInput';
import { navigationMemorizedUrlState } from '@/ui/navigation/states/navigationMemorizedUrlState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useCallback, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { SettingsPath } from 'twenty-shared/types';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const MultiSelectFieldInput = () => {
  const { fieldDefinition, draftValue, setDraftValue } = useMultiSelectField();
  const { objectNamePlural } = useParams();
  const navigateSettings = useNavigateSettings();
  const setNavigationMemorizedUrl = useSetRecoilState(
    navigationMemorizedUrlState,
  );

  const { onSubmit } = useContext(FieldInputEventContext);

  const handleOptionSelected = (newDraftValue: FieldMultiSelectValue) => {
    setDraftValue(newDraftValue);
  };

  const instanceId = useAvailableComponentInstanceIdOrThrow(
    RecordFieldComponentInstanceContext,
  );

  const handleCancel = () => {
    onSubmit?.({ newValue: draftValue });
  };

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

  return (
    <MultiSelectInput
      selectableListComponentInstanceId={
        SELECT_FIELD_INPUT_SELECTABLE_LIST_COMPONENT_INSTANCE_ID
      }
      focusId={instanceId}
      options={fieldDefinition.metadata.options}
      onCancel={handleCancel}
      onOptionSelected={handleOptionSelected}
      values={draftValue}
      onAddSelectOption={handleAddSelectOption}
    />
  );
};
