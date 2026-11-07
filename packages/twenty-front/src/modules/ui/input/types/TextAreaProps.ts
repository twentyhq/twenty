import { type FormFieldInputVariant } from '@/ui/input/types/FormFieldInputVariant';

export type TextAreaProps = {
  textAreaId: string;
  label?: string;
  disabled?: boolean;
  height?: number;
  minRows?: number;
  maxRows?: number;
  onChange?: (value: string) => void;
  placeholder?: string;
  value?: string;
  className?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  readOnly?: boolean;
  variant?: FormFieldInputVariant;
};
