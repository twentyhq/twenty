import { useState } from 'react';

import { FieldFocusContext } from '@/object-record/record-field/ui/contexts/FieldFocusContext';

const STATIC_UNFOCUSED_VALUE = {
  isFocused: false,
  setIsFocused: () => {},
};

const STATIC_FOCUSED_VALUE = {
  isFocused: true,
  setIsFocused: () => {},
};

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

export const FieldFocusStaticUnfocusedProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <FieldFocusContext.Provider value={STATIC_UNFOCUSED_VALUE}>
    {children}
  </FieldFocusContext.Provider>
);

export const FieldFocusStaticFocusedProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <FieldFocusContext.Provider value={STATIC_FOCUSED_VALUE}>
    {children}
  </FieldFocusContext.Provider>
);
