import { act, renderHook } from '@testing-library/react';
import { useState } from 'react';

import { useSpreadsheetImportInitialStep } from '@/spreadsheet-import/hooks/useSpreadsheetImportInitialStep';
import { SpreadsheetImportStepType } from '@/spreadsheet-import/steps/types/SpreadsheetImportStepType';

describe('useSpreadsheetImportInitialStep', () => {
  it('should return correct number for each step type', async () => {
    const { result } = renderHook(() => {
      const [step, setStep] = useState<SpreadsheetImportStepType | undefined>();
      const { initialStep } = useSpreadsheetImportInitialStep(step);
      return { initialStep, setStep };
    });

    expect(result.current.initialStep).toBe(0);

    act(() => {
      result.current.setStep(SpreadsheetImportStepType.upload);
    });

    expect(result.current.initialStep).toBe(0);

    act(() => {
      result.current.setStep(SpreadsheetImportStepType.selectSheet);
    });

    expect(result.current.initialStep).toBe(0);

    act(() => {
      result.current.setStep(SpreadsheetImportStepType.selectHeader);
    });

    expect(result.current.initialStep).toBe(0);

    act(() => {
      result.current.setStep(SpreadsheetImportStepType.matchColumns);
    });

    expect(result.current.initialStep).toBe(2);

    act(() => {
      result.current.setStep(SpreadsheetImportStepType.validateData);
    });

    expect(result.current.initialStep).toBe(3);
  });
});
