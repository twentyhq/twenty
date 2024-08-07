import styled from '@emotion/styled';
import { useCallback, useState } from 'react';

import { Heading } from '@/spreadsheet-import/components/Heading';
import { StepNavigationButton } from '@/spreadsheet-import/components/StepNavigationButton';
import { ImportedRow } from '@/spreadsheet-import/types';

import { Modal } from '@/ui/layout/modal/components/Modal';
import { SelectHeaderTable } from './components/SelectHeaderTable';

const StyledHeading = styled(Heading)`
  margin-bottom: ${({ theme }) => theme.spacing(8)};
`;

const StyledTableContainer = styled.div`
  display: flex;
  flex-grow: 1;
  height: 0px;
`;

type SelectHeaderStepProps = {
  importedRows: ImportedRow[];
  onContinue: (
    headerValues: ImportedRow,
    importedRows: ImportedRow[],
  ) => Promise<void>;
  onBack: () => void;
};

export const SelectHeaderStep = ({
  importedRows,
  onContinue,
  onBack,
}: SelectHeaderStepProps) => {
  const [selectedRowIndexes, setSelectedRowIndexes] = useState<
    ReadonlySet<number>
  >(new Set([0]));

  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = useCallback(async () => {
    const [selectedRowIndex] = Array.from(new Set(selectedRowIndexes));
    // We consider data above header to be redundant
    const trimmedData = importedRows.slice(selectedRowIndex + 1);

    setIsLoading(true);

    await onContinue(importedRows[selectedRowIndex], trimmedData);

    setIsLoading(false);
  }, [onContinue, importedRows, selectedRowIndexes]);

  return (
    <>
      <Modal.Content>
        <StyledHeading title="Select header row" />
        <StyledTableContainer>
          <SelectHeaderTable
            importedRows={importedRows}
            selectedRowIndexes={selectedRowIndexes}
            setSelectedRowIndexes={setSelectedRowIndexes}
          />
        </StyledTableContainer>
      </Modal.Content>
      <StepNavigationButton
        onClick={handleContinue}
        onBack={onBack}
        title="Continue"
        isLoading={isLoading}
      />
    </>
  );
};
