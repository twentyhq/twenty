import { type FormFieldInputVariant } from '@/ui/input/types/FormFieldInputVariant';

// A right element (the workflow variable picker) draws the field's right side,
// so the input box alone only has three sides of the field border.
export const hasFullFormFieldBorder = ({
  hasRightElement = false,
  variant = 'default',
}: {
  hasRightElement?: boolean;
  variant?: FormFieldInputVariant;
}) => !hasRightElement && variant !== 'transparent';
