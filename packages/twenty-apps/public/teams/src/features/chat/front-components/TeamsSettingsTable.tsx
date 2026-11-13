import styled from '@emotion/styled';
import { themeCssVariables } from 'twenty-ui/theme';

export const TeamsTable = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export const TeamsTableRow = styled.div<{ gridTemplateColumns: string }>`
  align-items: center;
  border-radius: ${() => themeCssVariables.border.radius.md};
  display: grid;
  grid-template-columns: ${({ gridTemplateColumns }) => gridTemplateColumns};
  width: 100%;
`;

export const TeamsTableHeader = styled.div<{ align?: 'left' | 'right' }>`
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

export const TeamsTableCell = styled.div<{ align?: 'left' | 'right' }>`
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

export const TeamsTableBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: ${() => themeCssVariables.spacing[2]} 0;
`;
