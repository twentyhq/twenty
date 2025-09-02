import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconKey, OverflowingTextWithTooltip } from 'twenty-ui/display';
import { type ApiKey } from '~/generated-metadata/graphql';

const StyledIconWrapper = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  margin-right: ${({ theme }) => theme.spacing(2)};
`;

const StyledNameCell = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  flex: 1;
  min-width: 0;
`;

const StyledNameContainer = styled.div`
  align-items: center;
  display: flex;
  overflow: hidden;
  width: 100%;
`;

const StyledTableCell = styled(TableCell)`
  overflow: hidden;
`;

type SettingsRoleAssignmentApiKeyTableRowProps = {
  apiKey: ApiKey;
};

export const SettingsRoleAssignmentApiKeyTableRow = ({
  apiKey,
}: SettingsRoleAssignmentApiKeyTableRowProps) => {
  const theme = useTheme();

  return (
    <TableRow gridAutoColumns="2fr 4fr">
      <StyledTableCell>
        <StyledNameContainer>
          <StyledIconWrapper>
            <IconKey size={theme.icon.size.md} />
          </StyledIconWrapper>
          <StyledNameCell>
            <OverflowingTextWithTooltip text={apiKey.name} />
          </StyledNameCell>
        </StyledNameContainer>
      </StyledTableCell>
      <StyledTableCell>
        <OverflowingTextWithTooltip
          text={
            apiKey.expiresAt
              ? new Date(apiKey.expiresAt).toLocaleDateString()
              : 'Never expires'
          }
        />
      </StyledTableCell>
    </TableRow>
  );
};
