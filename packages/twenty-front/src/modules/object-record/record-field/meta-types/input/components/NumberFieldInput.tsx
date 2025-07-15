import { TextInput } from '@/ui/field/input/components/TextInput';

import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/states/contexts/RecordFieldComponentInstanceContext';
import { FieldInputClickOutsideEvent } from '@/object-record/record-field/types/FieldInputEvent';
import { FieldInputContainer } from '@/ui/field/input/components/FieldInputContainer';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useNumberField } from '../../hooks/useNumberField';

export type FieldInputEvent = (persist: () => void) => void;

export type NumberFieldInputProps = {
  onClickOutside?: FieldInputClickOutsideEvent;
  onEnter?: FieldInputEvent;
  onEscape?: FieldInputEvent;
  onTab?: FieldInputEvent;
  onShiftTab?: FieldInputEvent;
};

export const NumberFieldInput = ({
  onEnter,
  onEscape,
  onClickOutside,
  onTab,
  onShiftTab,
}: NumberFieldInputProps) => {
  const { fieldDefinition, draftValue, setDraftValue, persistNumberField } =
    useNumberField();

  const instanceId = useAvailableComponentInstanceIdOrThrow(
    RecordFieldComponentInstanceContext,
  );

  const handleEnter = (newText: string) => {
    onEnter?.(() => persistNumberField(newText));
  };

  const handleEscape = (newText: string) => {
    onEscape?.(() => persistNumberField(newText));
  };

  const handleClickOutside = (
    event: MouseEvent | TouchEvent,
    newText: string,
  ) => {
    onClickOutside?.(() => persistNumberField(newText), event);
  };

  const handleTab = (newText: string) => {
    onTab?.(() => persistNumberField(newText));
  };

  const handleShiftTab = (newText: string) => {
    onShiftTab?.(() => persistNumberField(newText));
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
