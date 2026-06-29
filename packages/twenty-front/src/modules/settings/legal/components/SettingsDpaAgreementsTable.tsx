import { styled } from '@linaria/react';
import { Trans, useLingui } from '@lingui/react/macro';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import {
  DPA_AGREEMENT_ROW_GRID_COLUMNS,
  SettingsDpaAgreementRow,
} from '@/settings/legal/components/SettingsDpaAgreementRow';
import { type DpaAgreement } from '@/settings/legal/types/Dpa';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { downloadFile } from '@/activities/files/utils/downloadFile';

const StyledTableBodyContainer = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
`;

type SettingsDpaAgreementsTableProps = {
  agreements: DpaAgreement[];
};

export const SettingsDpaAgreementsTable = ({
  agreements,
}: SettingsDpaAgreementsTableProps) => {
  const { t } = useLingui();
  const { enqueueErrorSnackBar } = useSnackBar();

  const handleDownload = async (agreement: DpaAgreement) => {
    if (!agreement.downloadUrl) {
      return;
    }

    try {
      await downloadFile(
        agreement.downloadUrl,
        `Twenty-DPA-${agreement.templateVersion}-${agreement.customerLegalEntityName ?? 'copy'}.pdf`,
      );
    } catch {
      enqueueErrorSnackBar({ message: t`Could not download the document.` });
    }
  };

  return (
    <Table>
      <TableRow gridAutoColumns={DPA_AGREEMENT_ROW_GRID_COLUMNS}>
        <TableHeader>
          <Trans>Document</Trans>
        </TableHeader>
        <TableHeader>
          <Trans>Version</Trans>
        </TableHeader>
        <TableHeader>
          <Trans>Date</Trans>
        </TableHeader>
        <TableHeader></TableHeader>
      </TableRow>
      {agreements.length > 0 && (
        <StyledTableBodyContainer>
          <TableBody>
            {agreements.map((agreement) => (
              <SettingsDpaAgreementRow
                key={agreement.id}
                agreement={agreement}
                onDownload={handleDownload}
              />
            ))}
          </TableBody>
        </StyledTableBodyContainer>
      )}
    </Table>
  );
};
