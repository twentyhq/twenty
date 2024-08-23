import styled from '@emotion/styled';
import { useCallback, useState } from 'react';

import { Heading } from '@/spreadsheet-import/components/Heading';
import { StepNavigationButton } from '@/spreadsheet-import/components/StepNavigationButton';
import { ImportedRow } from '@/spreadsheet-import/types';

import { Modal } from '@/ui/layout/modal/components/Modal';

import { useSpreadsheetImportInternal } from '@/spreadsheet-import/hooks/useSpreadsheetImportInternal';
import { SpreadsheetImportStep } from '@/spreadsheet-import/steps/types/SpreadsheetImportStep';
import { SpreadsheetImportStepType } from '@/spreadsheet-import/steps/types/SpreadsheetImportStepType';
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
  setCurrentStepState: (currentStepState: SpreadsheetImportStep) => void;
  nextStep: () => void;
  setPreviousStepState: (currentStepState: SpreadsheetImportStep) => void;
  errorToast: (message: string) => void;
  onBack: () => void;
  currentStepState: SpreadsheetImportStep;
};

export const SelectHeaderStep = ({
  importedRows,
  setCurrentStepState,
  nextStep,
  setPreviousStepState,
  errorToast,
  onBack,
  currentStepState,
}: SelectHeaderStepProps) => {
  const [selectedRowIndexes, setSelectedRowIndexes] = useState<
    ReadonlySet<number>
  >(new Set([0]));

  const [isLoading, setIsLoading] = useState(false);

  const { selectHeaderStepHook } = useSpreadsheetImportInternal();

  const onContinue = useCallback(
    async (...args: Parameters<typeof selectHeaderStepHook>) => {
      try {
        const { importedRows: data, headerRow: headerValues } =
          await selectHeaderStepHook(...args);
        setCurrentStepState({
          type: SpreadsheetImportStepType.matchColumns,
          data,
          headerValues,
        });
        setPreviousStepState(currentStepState);
        nextStep();
      } catch (e) {
        errorToast((e as Error).message);
      }
    },
    [
      errorToast,
      nextStep,
      selectHeaderStepHook,
      setPreviousStepState,
      setCurrentStepState,
      currentStepState,
    ],
  );

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
