import styled from '@emotion/styled';
import { useCallback, useState } from 'react';

import { Heading } from '@/spreadsheet-import/components/Heading';
import { StepNavigationButton } from '@/spreadsheet-import/components/StepNavigationButton';
import { useSpreadsheetImportInternal } from '@/spreadsheet-import/hooks/useSpreadsheetImportInternal';
import { type SpreadsheetImportStep } from '@/spreadsheet-import/steps/types/SpreadsheetImportStep';
import { SpreadsheetImportStepType } from '@/spreadsheet-import/steps/types/SpreadsheetImportStepType';
import { exceedsMaxRecords } from '@/spreadsheet-import/utils/exceedsMaxRecords';
import { mapWorkbook } from '@/spreadsheet-import/utils/mapWorkbook';

import { Modal } from '@/ui/layout/modal/components/Modal';
import { useLingui } from '@lingui/react/macro';
import { Radio, RadioGroup } from 'twenty-ui/input';
import { type WorkBook } from 'xlsx-ugnis';

const StyledContent = styled(Modal.Content)`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(8)};
`;

const StyledHeading = styled(Heading)`
  display: flex;
`;

const StyledRadioContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledRadio = styled(Radio)`
  margin-bottom: ${({ theme }) => theme.spacing(6)};
`;

type SelectSheetStepProps = {
  sheetNames: string[];
  onBack: () => void;
  setCurrentStepState: (data: SpreadsheetImportStep) => void;
  onError: (message: string) => void;
  setPreviousStepState: (data: SpreadsheetImportStep) => void;
  currentStepState: {
    type: SpreadsheetImportStepType.selectSheet;
    workbook: WorkBook;
  };
};

export const SelectSheetStep = ({
  sheetNames,
  setCurrentStepState,
  onError,
  setPreviousStepState,
  onBack,
  currentStepState,
}: SelectSheetStepProps) => {
  const { t } = useLingui();
  const [isLoading, setIsLoading] = useState(false);

  const [value, setValue] = useState(sheetNames[0]);

  const { maxRecords, uploadStepHook } = useSpreadsheetImportInternal();

  const handleContinue = useCallback(
    async (sheetName: string) => {
      if (
        maxRecords > 0 &&
        exceedsMaxRecords(
          currentStepState.workbook.Sheets[sheetName],
          maxRecords,
        )
      ) {
        const maxRecordsString = maxRecords.toString();
        onError(t`Too many records. Up to ${maxRecordsString} allowed`);
        return;
      }
      try {
        const mappedWorkbook = await uploadStepHook(
          mapWorkbook(currentStepState.workbook, sheetName),
        );
        setCurrentStepState({
          type: SpreadsheetImportStepType.selectHeader,
          data: mappedWorkbook,
        });
        setPreviousStepState(currentStepState);
      } catch (e) {
        onError((e as Error).message);
      }
    },
    [
      onError,
      maxRecords,
      currentStepState,
      setPreviousStepState,
      setCurrentStepState,
      uploadStepHook,
      t,
    ],
  );

  const handleOnContinue = useCallback(
    async (data: typeof value) => {
      setIsLoading(true);
      await handleContinue(data);
      setIsLoading(false);
    },
    [handleContinue],
  );

  return (
    <>
      <StyledContent>
        <StyledHeading title={t`Select the sheet to use`} />
        <StyledRadioContainer>
          <RadioGroup onValueChange={(value) => setValue(value)} value={value}>
            {sheetNames.map((sheetName) => (
              <StyledRadio
                value={sheetName}
                key={sheetName}
                label={sheetName}
              />
            ))}
          </RadioGroup>
        </StyledRadioContainer>
      </StyledContent>
      <StepNavigationButton
        onContinue={() => handleOnContinue(value)}
        onBack={onBack}
        isLoading={isLoading}
        continueTitle={t`Next Step`}
      />
    </>
  );
};
