import { themeCssVariables } from 'twenty-ui/theme-constants';
import { styled } from '@linaria/react';

const StyledDropdownMenuSectionLabel = styled.div`
  background-color: ${themeCssVariables.background.transparent.lighter};
  color: ${themeCssVariables.font.color.tertiary};
  min-height: 20px;
  width: auto;
  font-size: ${themeCssVariables.font.size.xxs};
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding-left: ${themeCssVariables.spacing[1]};
  user-select: none;
`;

export type DropdownMenuSectionLabelProps = {
  label: string;
};

export const DropdownMenuSectionLabel = ({
  label,
}: DropdownMenuSectionLabelProps) => {
  return (
    <StyledDropdownMenuSectionLabel>{label}</StyledDropdownMenuSectionLabel>
  );
};
