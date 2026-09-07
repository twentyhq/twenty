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

  const handleEnter = (newText: string) => {
    const { success, value } = persistNumberValue(newText);

    const shouldNotPersist = !success;

    onEnter?.({ newValue: value, skipPersist: shouldNotPersist });
  };

  const handleEscape = (newText: string) => {
    const { success, value } = persistNumberValue(newText);

    const shouldNotPersist = !success;

    onEscape?.({ newValue: value, skipPersist: shouldNotPersist });
  };

  const handleClickOutside = (
    event: MouseEvent | TouchEvent,
    newText: string,
  ) => {
    const { success, value } = persistNumberValue(newText);

    const shouldNotPersist = !success;

    onClickOutside?.({ newValue: value, skipPersist: shouldNotPersist, event });
  };

  const handleTab = (newText: string) => {
    const { success, value } = persistNumberValue(newText);

    const shouldNotPersist = !success;

    onTab?.({ newValue: value, skipPersist: shouldNotPersist });
  };

  const handleShiftTab = (newText: string) => {
    const { success, value } = persistNumberValue(newText);

    const shouldNotPersist = !success;

    onShiftTab?.({ newValue: value, skipPersist: shouldNotPersist });
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
