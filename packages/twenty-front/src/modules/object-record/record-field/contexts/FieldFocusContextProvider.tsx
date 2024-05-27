import { useState } from 'react';

import { FieldFocusContext } from '@/object-record/record-field/contexts/FieldFocusContext';

export const FieldFocusContextProvider = ({ children }: any) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <FieldFocusContext.Provider
      value={{
        isFocused,
        setIsFocused,
      }}
    >
      {children}
    </FieldFocusContext.Provider>
  );
};
