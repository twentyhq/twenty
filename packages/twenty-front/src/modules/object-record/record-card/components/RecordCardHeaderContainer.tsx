import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

export const StyledBoardCardHeaderContainer = styled.div<{
  isCompact: boolean;
  padding?: string;
}>`
  align-items: center;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  font-weight: ${themeCssVariables.font.weight.medium};
  height: 24px;
  padding: ${({ padding, isCompact }) =>
    padding ??
    `${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[2]} ${isCompact ? themeCssVariables.spacing[2] : themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]}`};
  transition: padding ease-in-out 160ms;

  img {
    height: ${themeCssVariables.icon.size.md}px;
    object-fit: cover;
    width: ${themeCssVariables.icon.size.md}px;
  }
`;

export { StyledBoardCardHeaderContainer as RecordCardHeaderContainer };
