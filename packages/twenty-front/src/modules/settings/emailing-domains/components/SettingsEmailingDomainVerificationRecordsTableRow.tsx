import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { type VerificationRecord } from '~/generated-metadata/graphql';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

const StyledTruncatedCell = styled(TableCell)`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledEllipsisLabel = styled.div`
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledTypeCell = styled(TableCell)`
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

type SettingsEmailingDomainVerificationRecordsTableRowProps = {
  verificationRecord: VerificationRecord;
};

export const SettingsEmailingDomainVerificationRecordsTableRow = ({
  verificationRecord,
}: SettingsEmailingDomainVerificationRecordsTableRowProps) => {
  const theme = useTheme();
  const { copyToClipboard } = useCopyToClipboard();

  const { t } = useLingui();

  return (
    <TableRow gridAutoColumns="80px 2fr 3fr 80px 80px">
      <StyledTypeCell color={theme.font.color.primary}>
        {verificationRecord.type}
      </StyledTypeCell>

      <StyledTruncatedCell color={theme.font.color.secondary}>
        <StyledEllipsisLabel
          onClick={() =>
            copyToClipboard(
              verificationRecord.name,
              t`Name copied to clipboard`,
            )
          }
        >
          {verificationRecord.name}
        </StyledEllipsisLabel>
      </StyledTruncatedCell>

      <StyledTruncatedCell color={theme.font.color.secondary}>
        <StyledEllipsisLabel
          onClick={() =>
            copyToClipboard(
              verificationRecord.value,
              t`Value copied to clipboard`,
            )
          }
        >
          {verificationRecord.value}
        </StyledEllipsisLabel>
      </StyledTruncatedCell>

      <TableCell color={theme.font.color.tertiary}>
        {verificationRecord.priority || '-'}
      </TableCell>

      <TableCell color={theme.font.color.tertiary}>{t`Auto`}</TableCell>
    </TableRow>
  );
};
