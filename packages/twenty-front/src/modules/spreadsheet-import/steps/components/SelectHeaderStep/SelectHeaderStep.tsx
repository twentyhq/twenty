import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useCallback, useState } from 'react';

import { Heading } from '@/spreadsheet-import/components/Heading';
import { StepNavigationButton } from '@/spreadsheet-import/components/StepNavigationButton';
import { type ImportedRow } from '@/spreadsheet-import/types';

import { ModalContent } from 'twenty-ui/layout';

import { useComputeColumnSuggestionsAndAutoMatch } from '@/spreadsheet-import/hooks/useComputeColumnSuggestionsAndAutoMatch';
import { useSpreadsheetImportInternal } from '@/spreadsheet-import/hooks/useSpreadsheetImportInternal';
import { type SpreadsheetImportStep } from '@/spreadsheet-import/steps/types/SpreadsheetImportStep';
import { SpreadsheetImportStepType } from '@/spreadsheet-import/steps/types/SpreadsheetImportStepType';
import { useLingui } from '@lingui/react/macro';
import { SelectHeaderTable } from './components/SelectHeaderTable';

const StyledHeadingContainer = styled.div`
  margin-bottom: ${themeCssVariables.spacing[8]};
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
  onError: (message: string) => void;
  onBack: () => void;
  currentStepState: SpreadsheetImportStep;
};

export const SelectHeaderStep = ({
  importedRows,
  setCurrentStepState,
  nextStep,
  setPreviousStepState,
  onError,
  onBack,
  currentStepState,
}: SelectHeaderStepProps) => {
  const [selectedRowIndexes, setSelectedRowIndexes] = useState<
    ReadonlySet<number>
  >(new Set([0]));

  const [isLoading, setIsLoading] = useState(false);

  const { selectHeaderStepHook } = useSpreadsheetImportInternal();

  const computeColumnSuggestionsAndAutoMatch =
    useComputeColumnSuggestionsAndAutoMatch();

  const handleContinue = useCallback(
    async (...args: Parameters<typeof selectHeaderStepHook>) => {
      try {
        const { importedRows: data, headerRow: headerValues } =
          await selectHeaderStepHook(...args);

        await computeColumnSuggestionsAndAutoMatch({
          headerValues,
          data,
        });

        setCurrentStepState({
          type: SpreadsheetImportStepType.matchColumns,
          data,
          headerValues,
        });
        setPreviousStepState(currentStepState);
        nextStep();
      } catch (e) {
        onError((e as Error).message);
      }
    },
    [
      onError,
      nextStep,
      selectHeaderStepHook,
      setPreviousStepState,
      setCurrentStepState,
      currentStepState,
      computeColumnSuggestionsAndAutoMatch,
    ],
  );

  const handleOnContinue = useCallback(async () => {
    const [selectedRowIndex] = Array.from(new Set(selectedRowIndexes));
    // We consider data above header to be redundant
    const trimmedData = importedRows.slice(selectedRowIndex + 1);

    setIsLoading(true);

    await handleContinue(importedRows[selectedRowIndex], trimmedData);

    setIsLoading(false);
  }, [handleContinue, importedRows, selectedRowIndexes]);

  const { t } = useLingui();

  return (
    <>
      <ModalContent>
        <StyledHeadingContainer>
          <Heading title={t`Select header row`} />
        </StyledHeadingContainer>
        <StyledTableContainer>
          <SelectHeaderTable
            importedRows={importedRows}
            selectedRowIndexes={selectedRowIndexes}
            setSelectedRowIndexes={setSelectedRowIndexes}
          />
        </StyledTableContainer>
      </ModalContent>
      <StepNavigationButton
        onContinue={handleOnContinue}
        onBack={onBack}
        continueTitle={t`Continue`}
        isLoading={isLoading}
      />
    </>
  );
};
