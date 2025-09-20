import { useRecoilValue } from 'recoil';

import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { StepNavigationButton } from '@/spreadsheet-import/components/StepNavigationButton';
import { useSpreadsheetImportInternal } from '@/spreadsheet-import/hooks/useSpreadsheetImportInternal';
import { spreadsheetImportCreatedRecordsProgressState } from '@/spreadsheet-import/states/spreadsheetImportCreatedRecordsProgressState';
import { Modal } from '@/ui/layout/modal/components/Modal';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { Loader } from 'twenty-ui/feedback';

const StyledContent = styled(Modal.Content)`
  align-items: center;
  display: flex;
  justify-content: center;
  padding: 0px;
`;

const StyledHeader = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledDescription = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  margin-bottom: ${({ theme }) => theme.spacing(5)};
`;

type ImportDataStepProps = {
  recordsToImportCount: number;
};

export const ImportDataStep = ({
  recordsToImportCount,
}: ImportDataStepProps) => {
  const { onClose } = useSpreadsheetImportInternal();
  const spreadsheetImportCreatedRecordsProgress = useRecoilValue(
    spreadsheetImportCreatedRecordsProgressState,
  );
  const { formatNumber } = useNumberFormat();

  const formattedCreatedRecordsProgress = formatNumber(
    spreadsheetImportCreatedRecordsProgress,
  );
  const formattedRecordsToImportCount = formatNumber(recordsToImportCount);

  return (
    <>
      <StyledContent>
        <StyledHeader>{t`Importing Data ...`}</StyledHeader>
        <StyledDescription>{t`${formattedCreatedRecordsProgress} out of ${formattedRecordsToImportCount} records imported.`}</StyledDescription>
        <Loader />
      </StyledContent>
      <StepNavigationButton onBack={onClose} backTitle={t`Cancel`} />
    </>
  );
};
