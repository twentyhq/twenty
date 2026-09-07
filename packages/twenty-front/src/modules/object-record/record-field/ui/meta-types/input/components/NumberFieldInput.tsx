import { useContext } from 'react';

import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { useNumberField } from '@/object-record/record-field/ui/meta-types/hooks/useNumberField';
import { getNumberValueToPersist } from '@/object-record/record-field/ui/meta-types/input/utils/getNumberValueToPersist';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { FieldInputContainer } from '@/ui/field/input/components/FieldInputContainer';
import { TextInput } from '@/ui/field/input/components/TextInput';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';

export const NumberFieldInput = () => {
  const { fieldDefinition, draftValue, setDraftValue } = useNumberField();

  const { onEnter, onEscape, onClickOutside, onTab, onShiftTab } = useContext(
    FieldInputEventContext,
  );

  const instanceId = useAvailableComponentInstanceIdOrThrow(
    RecordFieldComponentInstanceContext,
  );

  const persistNumberValue = (newValue: string) =>
    getNumberValueToPersist({
      newValue,
      numberType: fieldDefinition.metadata.settings?.type,
    });

  const getFieldInputEventArgs = (
    persistResult: ReturnType<typeof persistNumberValue>,
  ) =>
    persistResult.success
      ? { newValue: persistResult.value, skipPersist: false }
      : { skipPersist: true };

  const handleEnter = (newText: string) => {
    onEnter?.(getFieldInputEventArgs(persistNumberValue(newText)));
  };

  const handleEscape = (newText: string) => {
    onEscape?.(getFieldInputEventArgs(persistNumberValue(newText)));
  };

  const handleClickOutside = (
    event: MouseEvent | TouchEvent,
    newText: string,
  ) => {
    onClickOutside?.({
      ...getFieldInputEventArgs(persistNumberValue(newText)),
      event,
    });
  };

  const handleTab = (newText: string) => {
    onTab?.(getFieldInputEventArgs(persistNumberValue(newText)));
  };

  const handleShiftTab = (newText: string) => {
    onShiftTab?.(getFieldInputEventArgs(persistNumberValue(newText)));
  };

  const handleChange = (newText: string) => {
    setDraftValue(newText);
  };

  return (
    <FieldInputContainer>
      <TextInput
        instanceId={instanceId}
        placeholder={fieldDefinition.metadata.placeHolder}
        autoFocus
        value={draftValue?.toString() ?? ''}
        onClickOutside={handleClickOutside}
        onEnter={handleEnter}
        onEscape={handleEscape}
        onShiftTab={handleShiftTab}
        onTab={handleTab}
        onChange={handleChange}
      />
    </FieldInputContainer>
  );
};
