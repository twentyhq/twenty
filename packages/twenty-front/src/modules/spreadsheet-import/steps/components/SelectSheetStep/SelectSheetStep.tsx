import styled from '@emotion/styled';
import { useCallback, useState } from 'react';

import { Heading } from '@/spreadsheet-import/components/Heading';
import { StepNavigationButton } from '@/spreadsheet-import/components/StepNavigationButton';
import { useSpreadsheetImportInternal } from '@/spreadsheet-import/hooks/useSpreadsheetImportInternal';
import { SpreadsheetImportStep } from '@/spreadsheet-import/steps/types/SpreadsheetImportStep';
import { SpreadsheetImportStepType } from '@/spreadsheet-import/steps/types/SpreadsheetImportStepType';
import { exceedsMaxRecords } from '@/spreadsheet-import/utils/exceedsMaxRecords';
import { mapWorkbook } from '@/spreadsheet-import/utils/mapWorkbook';
import { Radio, RadioGroup } from 'twenty-ui';

import { Modal } from '@/ui/layout/modal/components/Modal';
import { WorkBook } from 'xlsx-ugnis';

const StyledContent = styled(Modal.Content)`
  align-items: center;
  padding-left: ${({ theme }) => theme.spacing(6)};
  padding-right: ${({ theme }) => theme.spacing(6)};
`;

const StyledHeading = styled(Heading)`
  margin-bottom: ${({ theme }) => theme.spacing(8)};
`;

const StyledRadioContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  height: 0px;
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
        onError(`Too many records. Up to ${maxRecords.toString()} allowed`);
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
        <StyledHeading title="Select the sheet to use" />
        <StyledRadioContainer>
          <RadioGroup onValueChange={(value) => setValue(value)} value={value}>
            {sheetNames.map((sheetName) => (
              <Radio value={sheetName} key={sheetName} label={sheetName} />
            ))}
          </RadioGroup>
        </StyledRadioContainer>
      </StyledContent>
      <StepNavigationButton
        onClick={() => handleOnContinue(value)}
        onBack={onBack}
        isLoading={isLoading}
        title="Next Step"
      />
    </>
  );
};
