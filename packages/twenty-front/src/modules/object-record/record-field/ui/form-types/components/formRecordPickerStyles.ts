import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

export const StyledFormSelectContainerWrapper = styled.div<{
  readonly?: boolean;
}>`
  cursor: ${({ readonly }) => (readonly ? 'default' : 'pointer')};
  display: flex;
  height: 32px;
  min-width: 0;
  width: 100%;
`;

export const StyledIconButton = styled.div`
  display: flex;
  padding-right: ${themeCssVariables.spacing[2]};
`;

export const StyledDropdownContainer = styled.div`
  display: flex;
  flex: 1;
  min-width: 0;
`;

export const StyledVariablePickerContainer = styled.div`
  display: flex;
  flex-shrink: 0;
`;
