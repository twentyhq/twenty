import { useState } from 'react';

import { FieldFocusContext } from '@/object-record/record-field/ui/contexts/FieldFocusContext';

const NOOP = () => {};

const STATIC_UNFOCUSED_VALUE = {
  isFocused: false,
  setIsFocused: NOOP,
};

const STATIC_FOCUSED_VALUE = {
  isFocused: true,
  setIsFocused: NOOP,
};

// Stateful provider for contexts that need dynamic focus (inline cells, etc.)
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

// Static provider: no useState, always unfocused. Used in table display path.
export const FieldFocusStaticUnfocusedProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <FieldFocusContext.Provider value={STATIC_UNFOCUSED_VALUE}>
    {children}
  </FieldFocusContext.Provider>
);

// Static provider: no useState, always focused. Used in table hover portal.
export const FieldFocusStaticFocusedProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <FieldFocusContext.Provider value={STATIC_FOCUSED_VALUE}>
    {children}
  </FieldFocusContext.Provider>
);
