import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledOverflowCount = styled.span`
  align-items: center;
  background: ${themeCssVariables.background.tertiary};
  border: 1px solid ${themeCssVariables.background.primary};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  height: ${themeCssVariables.spacing[4]};
  margin-left: -${themeCssVariables.spacing[1]};
  padding: 0 ${themeCssVariables.spacing[1]};
`;

type CommandMenuItemSelectionOverflowCountProps = {
  count: number;
};

export const CommandMenuItemSelectionOverflowCount = ({
  count,
}: CommandMenuItemSelectionOverflowCountProps) => (
  <StyledOverflowCount>+{count}</StyledOverflowCount>
);
