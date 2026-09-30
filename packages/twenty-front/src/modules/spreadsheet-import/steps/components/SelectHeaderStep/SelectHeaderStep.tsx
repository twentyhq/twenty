import { Dialog } from 'twenty-ui/primitives/surfaces';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';
import { useCallback, useState } from 'react';

import { Heading } from '@/spreadsheet-import/components/Heading';
import { StepNavigationButton } from '@/spreadsheet-import/components/StepNavigationButton';
import { type ImportedRow } from '@/spreadsheet-import/types';

import { useComputeColumnSuggestionsAndAutoMatch } from '@/spreadsheet-import/hooks/useComputeColumnSuggestionsAndAutoMatch';
import { useSpreadsheetImportInternal } from '@/spreadsheet-import/hooks/useSpreadsheetImportInternal';
import { type SpreadsheetImportStep } from '@/spreadsheet-import/steps/types/SpreadsheetImportStep';
import { SpreadsheetImportStepType } from '@/spreadsheet-import/steps/types/SpreadsheetImportStepType';
import { useLingui } from '@lingui/react/macro';
import { SelectHeaderTable } from './components/SelectHeaderTable';
import { type SpreadsheetImportServerAdapter } from '@/spreadsheet-import/types/SpreadsheetImportServerAdapter';
import { isDefined } from 'twenty-shared/utils';

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
  const [selectedRowIndex, setSelectedRowIndex] = useState(0);

  const [isLoading, setIsLoading] = useState(false);

  const { selectHeaderStepHook, serverImport } = useSpreadsheetImportInternal();

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

  const handleServerContinue = useCallback(
    async (adapter: SpreadsheetImportServerAdapter) => {
      try {
        const { headerValues, data, rowCount } = await adapter.prepareRows({
          sheetName:
            currentStepState.type === SpreadsheetImportStepType.selectHeader
              ? currentStepState.sheetName
              : undefined,
          headerRowIndex: selectedRowIndex,
        });

        await computeColumnSuggestionsAndAutoMatch({ headerValues, data });

        setCurrentStepState({
          type: SpreadsheetImportStepType.matchColumns,
          data,
          headerValues,
          rowCount,
        });
        setPreviousStepState(currentStepState);
        nextStep();
      } catch (error) {
        onError(error instanceof Error ? error.message : String(error));
      }
    },
    [
      computeColumnSuggestionsAndAutoMatch,
      currentStepState,
      nextStep,
      onError,
      selectedRowIndex,
      setCurrentStepState,
      setPreviousStepState,
    ],
  );

  const handleOnContinue = useCallback(async () => {
    setIsLoading(true);

    if (isDefined(serverImport)) {
      await handleServerContinue(serverImport);
    } else {
      // We consider data above header to be redundant
      const trimmedData = importedRows.slice(selectedRowIndex + 1);

      await handleContinue(importedRows[selectedRowIndex], trimmedData);
    }

    setIsLoading(false);
  }, [
    handleContinue,
    handleServerContinue,
    importedRows,
    selectedRowIndex,
    serverImport,
  ]);

  const { t } = useLingui();

  return (
    <>
      <Dialog.Body
        style={{
          display: 'flex',
          flex: '1 1 0%',
          flexDirection: 'column',
          padding: 'var(--t-spacing-10)',
        }}
      >
        <StyledHeadingContainer>
          <Heading title={t`Select header row`} />
        </StyledHeadingContainer>
        <StyledTableContainer>
          <SelectHeaderTable
            importedRows={importedRows}
            selectedRowIndex={selectedRowIndex}
            onSelectedRowChange={setSelectedRowIndex}
          />
        </StyledTableContainer>
      </Dialog.Body>
      <StepNavigationButton
        onContinue={handleOnContinue}
        onBack={onBack}
        continueTitle={t`Continue`}
        isLoading={isLoading}
      />
    </>
  );
};
