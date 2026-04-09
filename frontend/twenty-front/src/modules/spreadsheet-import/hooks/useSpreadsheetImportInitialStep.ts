import { SpreadsheetImportStepType } from '@/spreadsheet-import/steps/types/SpreadsheetImportStepType';
import { useMemo } from 'react';

export const useSpreadsheetImportInitialStep = (
  initialStep?: SpreadsheetImportStepType,
) => {
  const steps = ['uploadStep', 'matchColumnsStep', 'validationStep'] as const;

  const initialStepNumber = useMemo(() => {
    switch (initialStep) {
      case SpreadsheetImportStepType.upload:
        return 0;
      case SpreadsheetImportStepType.selectSheet:
        return 0;
      case SpreadsheetImportStepType.selectHeader:
        return 0;
      case SpreadsheetImportStepType.matchColumns:
        return 2;
      case SpreadsheetImportStepType.validateData:
        return 3;
      default:
        return 0;
    }
  }, [initialStep]);

  return { steps, initialStep: initialStepNumber };
};
