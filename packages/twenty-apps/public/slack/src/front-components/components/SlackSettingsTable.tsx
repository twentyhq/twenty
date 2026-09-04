import styled from '@emotion/styled';
import { themeCssVariables } from 'twenty-ui/theme-constants';

export const SlackTable = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export const SlackTableRow = styled.div<{ gridTemplateColumns: string }>`
  align-items: center;
  border-radius: ${() => themeCssVariables.border.radius.md};
  display: grid;
  grid-template-columns: ${({ gridTemplateColumns }) => gridTemplateColumns};
  width: 100%;
`;

export const SlackTableHeader = styled.div<{ align?: 'left' | 'right' }>`
  align-items: center;
  border-bottom: 1px solid ${() => themeCssVariables.border.color.light};
  color: ${() => themeCssVariables.font.color.tertiary};
  display: flex;
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.sm};
  font-weight: ${() => themeCssVariables.font.weight.medium};
  height: ${() => themeCssVariables.spacing[8]};
  justify-content: ${({ align }) =>
    align === 'right' ? 'flex-end' : 'flex-start'};
  padding: 0 ${() => themeCssVariables.spacing[2]};
`;

export const SlackTableCell = styled.div<{ align?: 'left' | 'right' }>`
  align-items: center;
  color: ${() => themeCssVariables.font.color.secondary};
  display: flex;
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.sm};
  gap: ${() => themeCssVariables.spacing[2]};
  justify-content: ${({ align }) =>
    align === 'right' ? 'flex-end' : 'flex-start'};
  min-height: ${() => themeCssVariables.spacing[8]};
  min-width: 0;
  padding: 0 ${() => themeCssVariables.spacing[2]};
`;

export const SlackTableBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: ${() => themeCssVariables.spacing[2]} 0;
`;
