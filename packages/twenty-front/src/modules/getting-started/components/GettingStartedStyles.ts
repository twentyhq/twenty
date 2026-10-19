import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

export const StyledGettingStartedColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const StyledGettingStartedRow = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

export const StyledGettingStartedMuted = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

export const StyledGettingStartedBadge = styled.span`
  align-items: center;
  background: ${themeCssVariables.background.tertiary};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.secondary};
  display: inline-flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: 4px;
  padding: 2px 5px;
  white-space: nowrap;
`;

export const StyledGettingStartedInput = styled.input`
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.primary};
  flex: 1;
  font: inherit;
  min-width: 0;
  padding: 8px;
  &:focus-visible {
    outline: 2px solid ${themeCssVariables.color.blue};
  }
`;

export const StyledGettingStartedDigit = styled.span`
  background: ${themeCssVariables.color.amber3};
  border: 1px solid ${themeCssVariables.color.amber6};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.color.amber11};
  display: inline-block;
  font-size: 28px;
  line-height: 40px;
  text-align: center;
  width: 30px;
`;
