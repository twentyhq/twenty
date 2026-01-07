import styled from '@emotion/styled';
import { type ServerlessFunction } from '~/generated-metadata/graphql';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { useTheme } from '@emotion/react';
import { IconChevronRight } from 'twenty-ui/display';
import { StyledTableRow } from '@/settings/serverless-functions/components/SettingsServerlessFunctionsTable';

const StyledNameTableCell = styled(TableCell)`
  color: ${({ theme }) => theme.font.color.primary};
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledRuntimeTableCell = styled(TableCell)`
  color: ${({ theme }) => theme.font.color.secondary};
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledIconTableCell = styled(TableCell)`
  justify-content: center;
  padding-right: ${({ theme }) => theme.spacing(1)};
`;

const StyledIconChevronRight = styled(IconChevronRight)`
  color: ${({ theme }) => theme.font.color.tertiary};
`;

export const SettingsServerlessFunctionsFieldItemTableRow = ({
  serverlessFunction,
  to,
}: {
  serverlessFunction: ServerlessFunction;
  to: string;
}) => {
  const theme = useTheme();
  return (
    <StyledTableRow to={to}>
      <StyledNameTableCell>{serverlessFunction.name}</StyledNameTableCell>
      <StyledNameTableCell></StyledNameTableCell>
      <StyledRuntimeTableCell>
        {serverlessFunction.runtime}
      </StyledRuntimeTableCell>
      <StyledIconTableCell>
        <StyledIconChevronRight
          size={theme.icon.size.md}
          stroke={theme.icon.stroke.sm}
        />
      </StyledIconTableCell>
    </StyledTableRow>
  );
};
