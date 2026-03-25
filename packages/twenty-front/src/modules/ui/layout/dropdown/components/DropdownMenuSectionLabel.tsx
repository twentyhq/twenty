import { themeCssVariables } from 'twenty-ui/theme-constants';
import { styled } from '@linaria/react';

const StyledDropdownMenuSectionLabel = styled.div`
  align-items: center;
  background-color: ${themeCssVariables.background.transparent.lighter};
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${themeCssVariables.font.size.xxs};
  justify-content: flex-start;
  min-height: 20px;
  padding-left: ${themeCssVariables.spacing[1]};
  user-select: none;
  width: auto;
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
