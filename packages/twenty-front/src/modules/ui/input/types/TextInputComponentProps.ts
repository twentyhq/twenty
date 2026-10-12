import { type ComponentPropsWithRef, type InputHTMLAttributes } from 'react';
import { type IconComponent } from 'twenty-ui/icon';
import { type TextInputSize } from '@/ui/input/types/TextInputSize';

export type TextInputComponentProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'onChange'
> & {
  label?: string;
  onChange?: (text: string) => void;
  inputProps?: ComponentPropsWithRef<'input'>;
  fullWidth?: boolean;
  error?: string;
  noErrorHelper?: boolean;
  RightIcon?: IconComponent;
  onRightIconClick?: () => void;
  LeftIcon?: IconComponent;
  autoGrow?: boolean;
  dataTestId?: string;
  sizeVariant?: TextInputSize;
  inheritFontStyles?: boolean;
  rightAdornment?: string;
  leftAdornment?: string;
  textClickOutsideId?: string;
  ignorePasswordManagers?: boolean;
};
