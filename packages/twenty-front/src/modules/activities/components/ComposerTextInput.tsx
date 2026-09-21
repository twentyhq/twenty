import { FORM_FIELD_PLACEHOLDER_STYLES } from '@/ui/input/constants/FormFieldPlaceholderStyles';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

export const StyledComposerTextInput = styled.input`
  background: transparent;
  border: none;
  color: ${themeCssVariables.font.color.primary};
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.regular};
  outline: none;
  padding: 0;
  width: 100%;

  &::placeholder {
    ${FORM_FIELD_PLACEHOLDER_STYLES}
  }
`;
