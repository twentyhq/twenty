import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledHeading = styled.div`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  height: ${themeCssVariables.spacing[8]};
  padding-left: ${themeCssVariables.spacing[1]};
  user-select: none;

  &[data-active='true'] {
    background: ${themeCssVariables.background.transparent.light};
    border-radius: ${themeCssVariables.border.radius.sm};
  }
`;

type CommandMenuItemSectionHeadingProps = {
  isActive?: boolean;
  children: ReactNode;
};

export const CommandMenuItemSectionHeading = ({
  isActive = false,
  children,
}: CommandMenuItemSectionHeadingProps) => (
  <StyledHeading data-active={isActive}>{children}</StyledHeading>
);
