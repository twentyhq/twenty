import { FieldPathPicker } from '@/object-record/field-path-picker/components/FieldPathPicker';
import { usePersistField } from '@/object-record/record-field/hooks/usePersistField';
import { useFieldPathField } from '@/object-record/record-field/meta-types/hooks/useFieldPathField';
import { FieldInputEvent } from './DateFieldInput';

export type FieldPathFieldInputProps = {
  onClickOutside?: FieldInputEvent;
  onEnter?: FieldInputEvent;
  onEscape?: FieldInputEvent;
  onTab?: FieldInputEvent;
  onShiftTab?: FieldInputEvent;
};

export const FieldPathFieldInput = ({
  onEnter,
  onEscape,
  onClickOutside,
  onTab,
  onShiftTab,
}: FieldPathFieldInputProps) => {
  const {
    draftValue,
    setDraftValue,
    fieldDefinition,
    fieldValue,
    setFieldValue,
    hotkeyScope,
    sourceObjectNameSingular,
  } = useFieldPathField();

  const persistField = usePersistField();

  const handleEnter = (newFieldPath: string[]) => {
    onEnter?.(() => persistField(newFieldPath));
  };

  const handleEscape = (newFieldPath: string[]) => {
    onEscape?.(() => persistField(newFieldPath));
  };

  const handleClickOutside = (
    event: MouseEvent | TouchEvent,
    newFieldPath: string[],
  ) => {
    console.log('handleClickOutside', event, newFieldPath);
    onClickOutside?.(() => null /* persistField(newFieldPath) */); // TODO: Implement string array saving in persistField
  };

  const handleTab = (newFieldPath: string[]) => {
    onTab?.(() => persistField(newFieldPath));
  };

  const handleShiftTab = (newFieldPath: string[]) => {
    onShiftTab?.(() => persistField(newFieldPath));
  };

  const handleChange = (newFieldPath: string[]) => {
    setDraftValue(newFieldPath);
  };

  return (
    <FieldPathPicker
      value={draftValue}
      hotkeyScope={hotkeyScope}
      sourceObjectNameSingular={sourceObjectNameSingular}
      onClickOutside={handleClickOutside}
      onEnter={handleEnter}
      onEscape={handleEscape}
      onShiftTab={handleShiftTab}
      onTab={handleTab}
      onChange={handleChange}
    />
  );
};
