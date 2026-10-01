import { type InputHTMLAttributes, type ReactNode } from 'react';

type HTMLInputProps = InputHTMLAttributes<HTMLInputElement>;

export type MultiItemBaseInputProps = Pick<
  HTMLInputProps,
  'autoFocus' | 'className' | 'value' | 'placeholder' | 'onFocus' | 'onBlur'
> & {
  onClickOutside?: () => void;
  onEnter?: () => void;
  onEscape?: () => void;
  onShiftTab?: () => void;
  onTab?: () => void;
  rightComponent?: ReactNode;
  renderInput?: (
    props: Pick<
      HTMLInputProps,
      'value' | 'autoFocus' | 'placeholder' | 'onKeyDown' | 'onFocus' | 'onBlur'
    > & {
      onChange: (value: string) => void;
      hasError?: boolean;
    },
  ) => ReactNode;
  error?: string | null;
  hasError?: boolean;
  hasItem: boolean;
  onChange: (value: string) => void;
  instanceId: string;
};
