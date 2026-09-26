import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

const DATE_PICKER_CONTAINER_WIDTH = 280;

export const StyledDatePickerContainer = styled.div`
  font-size: ${themeCssVariables.font.size.md};
  width: ${DATE_PICKER_CONTAINER_WIDTH}px;

  & .clearable {
    border-bottom: 1px solid ${themeCssVariables.border.color.light};
  }
`;
