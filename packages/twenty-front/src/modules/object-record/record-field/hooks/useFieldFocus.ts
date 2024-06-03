import { useContext } from 'react';

import { FieldFocusContext } from '@/object-record/record-field/contexts/FieldFocusContext';

export const useFieldFocus = () => {
  const { isFocused, setIsFocused } = useContext(FieldFocusContext);

  return {
    isFocused,
    setIsFocused,
  };
};
