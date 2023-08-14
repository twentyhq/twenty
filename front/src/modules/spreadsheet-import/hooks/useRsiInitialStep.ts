import { useMemo } from 'react';

import { StepType } from '@/spreadsheet-import/components/steps/UploadFlow';

export const useRsiInitialStep = (initialStep?: StepType) => {
  const steps = ['uploadStep', 'matchColumnsStep', 'validationStep'] as const;

  const initialStepNumber = useMemo(() => {
    switch (initialStep) {
      case StepType.upload:
        return 0;
      case StepType.selectSheet:
        return 0;
      case StepType.selectHeader:
        return 0;
      case StepType.matchColumns:
        return 2;
      case StepType.validateData:
        return 3;
      default:
        return -1;
    }
  }, [initialStep]);

  return { steps, initialStep: initialStepNumber };
};
