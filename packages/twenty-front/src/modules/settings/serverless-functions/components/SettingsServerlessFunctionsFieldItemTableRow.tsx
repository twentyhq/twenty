import styled from '@emotion/styled';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { ServerlessFunction } from '~/generated-metadata/graphql';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { IconChevronRight } from 'twenty-ui';
import { useTheme } from '@emotion/react';

export const StyledApisFieldTableRow = styled(TableRow)`
  grid-template-columns: 312px 132px 68px;
`;

const StyledNameTableCell = styled(TableCell)`
  color: ${({ theme }) => theme.font.color.primary};
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
    <StyledApisFieldTableRow to={to}>
      <StyledNameTableCell>{serverlessFunction.name}</StyledNameTableCell>
      <StyledNameTableCell>{serverlessFunction.runtime}</StyledNameTableCell>
      <StyledIconTableCell>
        <StyledIconChevronRight
          size={theme.icon.size.md}
          stroke={theme.icon.stroke.sm}
        />
      </StyledIconTableCell>
    </StyledApisFieldTableRow>
  );
};
