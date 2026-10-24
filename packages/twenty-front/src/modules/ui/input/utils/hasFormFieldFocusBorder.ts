import { type FormFieldInputVariant } from '@/ui/input/types/FormFieldInputVariant';

export const hasFormFieldFocusBorder = ({
  hasRightElement = false,
  variant = 'default',
}: {
  hasRightElement?: boolean;
  variant?: FormFieldInputVariant;
}) => !hasRightElement && variant !== 'transparent';
