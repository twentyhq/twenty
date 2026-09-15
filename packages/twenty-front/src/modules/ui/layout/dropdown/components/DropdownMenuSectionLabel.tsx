import { themeCssVariables } from 'twenty-ui/theme-constants';
import { styled } from '@linaria/react';

const StyledDropdownMenuSectionLabel = styled.div`
  align-items: center;
  background-color: ${themeCssVariables.background.transparent.lighter};
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${themeCssVariables.font.size.xxs};
  justify-content: flex-start;
  min-height: 20px;
  padding-left: ${themeCssVariables.spacing[2]};
  padding-right: ${themeCssVariables.spacing[2]};
  user-select: none;
  width: 100%;
`;

export type DropdownMenuSectionLabelProps = {
  label: string;
};

export const DropdownMenuSectionLabel = ({
  label,
}: DropdownMenuSectionLabelProps) => {
  return (
    <StyledDropdownMenuSectionLabel data-dropdown-menu-section-label>
      {label}
    </StyledDropdownMenuSectionLabel>
  );
};
