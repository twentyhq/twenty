import { type FormFieldInputVariant } from '@/ui/input/types/FormFieldInputVariant';
import { hasFullFormFieldBorder } from '@/ui/input/utils/hasFullFormFieldBorder';
import { themeCssVariables } from 'twenty-ui/theme';

export const getFormFieldBorderColor = ({
  isFocused = false,
  hasRightElement,
  variant,
}: {
  isFocused?: boolean;
  hasRightElement?: boolean;
  variant?: FormFieldInputVariant;
}) =>
  isFocused && hasFullFormFieldBorder({ hasRightElement, variant })
    ? themeCssVariables.color.blue
    : themeCssVariables.border.color.medium;
