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
  preventTabNavigation?: boolean;
  leftComponent?: ReactNode;
  rightComponent?: ReactNode;
  renderInput?: (
    props: Pick<
      HTMLInputProps,
      'value' | 'autoFocus' | 'placeholder' | 'onKeyDown' | 'onFocus' | 'onBlur'
    > & {
      onChange: (value: string) => void;
      hasError?: boolean;
      isFramed?: boolean;
    },
  ) => ReactNode;
  error?: string | null;
  hasError?: boolean;
  hasItem: boolean;
  isFramed?: boolean;
  onChange: (value: string) => void;
  instanceId: string;
};
