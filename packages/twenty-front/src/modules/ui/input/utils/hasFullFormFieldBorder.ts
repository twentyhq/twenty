import { type FormFieldInputVariant } from '@/ui/input/types/FormFieldInputVariant';

// A right element (the variable picker) draws the field's right side.
export const hasFullFormFieldBorder = ({
  hasRightElement = false,
  variant = 'default',
}: {
  hasRightElement?: boolean;
  variant?: FormFieldInputVariant;
}) => !hasRightElement && variant !== 'transparent';
