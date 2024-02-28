import { useState } from 'react';
import { act, renderHook } from '@testing-library/react';

import { useSpreadsheetImportInitialStep } from '@/spreadsheet-import/hooks/useSpreadsheetImportInitialStep';
import { StepType } from '@/spreadsheet-import/steps/components/UploadFlow';

describe('useSpreadsheetImportInitialStep', () => {
  it('should return correct number for each step type', async () => {
    const { result } = renderHook(() => {
      const [step, setStep] = useState<StepType | undefined>();
      const { initialStep } = useSpreadsheetImportInitialStep(step);
      return { initialStep, setStep };
    });

    expect(result.current.initialStep).toBe(-1);

    act(() => {
      result.current.setStep(StepType.upload);
    });

    expect(result.current.initialStep).toBe(0);

    act(() => {
      result.current.setStep(StepType.selectSheet);
    });

    expect(result.current.initialStep).toBe(0);

    act(() => {
      result.current.setStep(StepType.selectHeader);
    });

    expect(result.current.initialStep).toBe(0);

    act(() => {
      result.current.setStep(StepType.matchColumns);
    });

    expect(result.current.initialStep).toBe(2);

    act(() => {
      result.current.setStep(StepType.validateData);
    });

    expect(result.current.initialStep).toBe(3);
  });
});
