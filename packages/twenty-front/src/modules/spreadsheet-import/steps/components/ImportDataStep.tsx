import { useSetRecoilState } from 'recoil';

import { StepNavigationButton } from '@/spreadsheet-import/components/StepNavigationButton';
import { useSpreadsheetImportInternal } from '@/spreadsheet-import/hooks/useSpreadsheetImportInternal';
import { isStepBarVisibleState } from '@/spreadsheet-import/states/isStepBarVisibleState';
import { Modal } from '@/ui/layout/modal/components/Modal';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { Loader } from 'twenty-ui/feedback';
import { formatNumber } from '~/utils/format/number';

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

export const ImportDataStep = () => {
  const { onClose } = useSpreadsheetImportInternal();

  const setIsStepBarVisible = useSetRecoilState(isStepBarVisibleState);
  setIsStepBarVisible(false);

  const importedRecords = formatNumber(10000000);
  const totalRecords = 100;

  return (
    <>
      <StyledContent>
        <StyledHeader>{t`Importing Data ...`}</StyledHeader>
        <StyledDescription>{t`${importedRecords} out of ${totalRecords} records imported.`}</StyledDescription>
        <Loader />
      </StyledContent>
      <StepNavigationButton onBack={onClose} backTitle={t`Cancel`} />
    </>
  );
};
