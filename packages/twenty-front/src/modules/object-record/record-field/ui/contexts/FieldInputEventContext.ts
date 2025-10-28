import { createContext } from 'react';

export type FieldInputEventArgs = {
  newValue?: unknown;
  skipPersist?: boolean;
};

export type FieldInputEvent = (args: FieldInputEventArgs) => void;

export type FieldInputClickOutsideEvent = (args: {
  newValue?: unknown;
  skipPersist?: boolean;
  event?: MouseEvent | TouchEvent;
}) => void;

export type FieldInputEventContextType = {
  onEnter?: FieldInputEvent;
  onCancel?: () => void;
  onEscape?: FieldInputEvent;
  onSubmit?: FieldInputEvent;
  onTab?: FieldInputEvent;
  onShiftTab?: FieldInputEvent;
  onClickOutside?: FieldInputClickOutsideEvent;
};

export const FieldInputEventContext = createContext<FieldInputEventContextType>(
  {} as FieldInputEventContextType,
);
