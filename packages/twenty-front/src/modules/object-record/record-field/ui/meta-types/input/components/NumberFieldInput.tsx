import { TextInput } from '@/ui/field/input/components/TextInput';

import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { FieldInputContainer } from '@/ui/field/input/components/FieldInputContainer';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { isNull } from '@sniptt/guards';
import { useContext } from 'react';
import {
  canBeCastAsNumberOrNull,
  castAsNumberOrNull,
} from '~/utils/cast-as-number-or-null';
import { useNumberField } from '@/object-record/record-field/ui/meta-types/hooks/useNumberField';

export const NumberFieldInput = () => {
  const { fieldDefinition, draftValue, setDraftValue } = useNumberField();

  const { onEnter, onEscape, onClickOutside, onTab, onShiftTab } = useContext(
    FieldInputEventContext,
  );

  const instanceId = useAvailableComponentInstanceIdOrThrow(
    RecordFieldComponentInstanceContext,
  );

  const getNumberValueToPersist = (
    newValue: string,
  ): { success: boolean; value?: any } => {
    if (fieldDefinition?.metadata?.settings?.type === 'percentage') {
      const newValueEscaped = newValue.replaceAll('%', '');

      if (!canBeCastAsNumberOrNull(newValueEscaped)) {
        return { success: false };
      }

      const castedValue = castAsNumberOrNull(newValue);

      if (!isNull(castedValue)) {
        return { success: true, value: castedValue / 100 };
      }

      return { success: true, value: null };
    }

    if (!canBeCastAsNumberOrNull(newValue)) {
      return { success: false };
    }

    const castedValue = castAsNumberOrNull(newValue);

    return { success: true, value: castedValue };
  };

  const handleEnter = (newText: string) => {
    const { success, value } = getNumberValueToPersist(newText);

    const shouldNotPersist = !success;

    onEnter?.({ newValue: value, skipPersist: shouldNotPersist });
  };

  const handleEscape = (newText: string) => {
    const { success, value } = getNumberValueToPersist(newText);

    const shouldNotPersist = !success;

    onEscape?.({ newValue: value, skipPersist: shouldNotPersist });
  };

  const handleClickOutside = (
    event: MouseEvent | TouchEvent,
    newText: string,
  ) => {
    const { success, value } = getNumberValueToPersist(newText);

    const shouldNotPersist = !success;

    onClickOutside?.({ newValue: value, skipPersist: shouldNotPersist, event });
  };

  const handleTab = (newText: string) => {
    const { success, value } = getNumberValueToPersist(newText);

    const shouldNotPersist = !success;

    onTab?.({ newValue: value, skipPersist: shouldNotPersist });
  };

  const handleShiftTab = (newText: string) => {
    const { success, value } = getNumberValueToPersist(newText);

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
