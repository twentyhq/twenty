import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Button } from 'twenty-ui/input';
import { IconDownload } from 'twenty-ui/icon';

import { type DpaAgreement } from '@/settings/legal/types/Dpa';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { beautifyExactDateTime } from '~/utils/date-utils';

export const DPA_AGREEMENT_ROW_GRID_COLUMNS = '3fr 2fr 2fr 140px';

const StyledEllipsisLabel = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

type SettingsDpaAgreementRowProps = {
  agreement: DpaAgreement;
  onDownload: (agreement: DpaAgreement) => void;
};

export const SettingsDpaAgreementRow = ({
  agreement,
  onDownload,
}: SettingsDpaAgreementRowProps) => {
  const { t } = useLingui();

  const label =
    agreement.type === 'SIGNED'
      ? (agreement.customerLegalEntityName ?? t`Signed copy`)
      : t`Click-through acceptance`;

  return (
    <TableRow gridAutoColumns={DPA_AGREEMENT_ROW_GRID_COLUMNS}>
      <TableCell whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
        <StyledEllipsisLabel>{label}</StyledEllipsisLabel>
      </TableCell>
      <TableCell>{agreement.templateVersion}</TableCell>
      <TableCell>{beautifyExactDateTime(agreement.acceptedAt)}</TableCell>
      <TableCell align="right">
        {agreement.downloadUrl ? (
          <Button
            Icon={IconDownload}
            title={t`Download`}
            size="small"
            variant="tertiary"
            onClick={() => onDownload(agreement)}
          />
        ) : (
          '—'
        )}
      </TableCell>
    </TableRow>
  );
};
