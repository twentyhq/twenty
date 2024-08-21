import { DataExplorerQueryBuilder } from '@/object-record/data-explorer-query-builder/components/DataExplorerQueryBuilder';
import { usePersistField } from '@/object-record/record-field/hooks/usePersistField';
import { useDataExplorerQueryField } from '@/object-record/record-field/meta-types/hooks/useDataExplorerQueryField';
import { FieldDataExplorerQueryValue } from '@/object-record/record-field/types/FieldMetadata';
import { FieldInputEvent } from './DateTimeFieldInput';

export type FieldDataExplorerQueryInputProps = {
  onClickOutside?: FieldInputEvent;
  onEnter?: FieldInputEvent;
  onEscape?: FieldInputEvent;
  onTab?: FieldInputEvent;
  onShiftTab?: FieldInputEvent;
};

export const FieldDataExplorerQueryInput = ({
  onEnter,
  onEscape,
  onClickOutside,
  onTab,
  onShiftTab,
}: FieldDataExplorerQueryInputProps) => {
  const {
    draftValue,
    setDraftValue,
    /* fieldDefinition,
    fieldValue,
    setFieldValue, */
    hotkeyScope,
    sourceObjectNameSingular,
  } = useDataExplorerQueryField();

  const persistField = usePersistField();

  const handleEnter = (newValue: FieldDataExplorerQueryValue) => {
    onEnter?.(() => persistField(newValue));
  };

  const handleEscape = (newValue: FieldDataExplorerQueryValue) => {
    onEscape?.(() => persistField(newValue));
  };

  const handleClickOutside = (
    event: MouseEvent | TouchEvent,
    newValue: FieldDataExplorerQueryValue,
  ) => {
    onClickOutside?.(() => persistField(newValue)); // TODO: Implement string array saving in persistField
  };

  const handleTab = (newValue?: FieldDataExplorerQueryValue) => {
    onTab?.(() => persistField(newValue));
  };

  const handleShiftTab = (newValue: FieldDataExplorerQueryValue) => {
    onShiftTab?.(() => persistField(newValue));
  };

  const handleChange = (newValue: FieldDataExplorerQueryValue) => {
    setDraftValue(newValue ?? undefined);
  };

  return (
    <DataExplorerQueryBuilder
      value={draftValue}
      hotkeyScope={hotkeyScope}
      onClickOutside={handleClickOutside}
      onEnter={handleEnter}
      onEscape={handleEscape}
      onShiftTab={handleShiftTab}
      onTab={handleTab}
      onChange={handleChange}
    />
  );
};
