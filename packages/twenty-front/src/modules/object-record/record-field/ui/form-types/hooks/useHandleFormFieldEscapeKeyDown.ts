import { FormFieldEscapeContext } from '@/object-record/record-field/ui/contexts/FormFieldEscapeContext';
import { type KeyboardEvent, useContext } from 'react';
import { Key } from 'ts-key-enum';
import { isDefined } from 'twenty-shared/utils';

export const useHandleFormFieldEscapeKeyDown = () => {
  const onFieldEscape = useContext(FormFieldEscapeContext);

  return (event: KeyboardEvent<HTMLElement>) => {
    if (
      event.key !== Key.Escape ||
      event.nativeEvent.isComposing ||
      !isDefined(onFieldEscape)
    ) {
      return;
    }

    event.stopPropagation();
    onFieldEscape();
  };
};
