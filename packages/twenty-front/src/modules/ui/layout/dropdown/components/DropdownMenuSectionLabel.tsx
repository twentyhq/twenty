import { themeCssVariables } from 'twenty-ui/theme';
import { styled } from '@linaria/react';

const StyledDropdownMenuSectionLabel = styled.div`
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  line-height: ${themeCssVariables.text.lineHeight.md};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[2]} 0;
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
