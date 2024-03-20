import { act } from 'react-dom/test-utils';
import { renderHook } from '@testing-library/react';
import { RecoilRoot, useRecoilValue } from 'recoil';

import { stepBarInternalState } from '../../states/stepBarInternalState';
import { useStepBar } from '../useStepBar';

const renderHooks = (initialStep: number) => {
  const { result } = renderHook(
    () => {
      const { nextStep, prevStep, reset, setStep } = useStepBar({
        initialStep,
      });
      const stepBarInternal = useRecoilValue(stepBarInternalState);

      return {
        nextStep,
        prevStep,
        reset,
        setStep,
        stepBarInternal,
      };
    },
    {
      wrapper: RecoilRoot,
    },
  );

  return { result };
};

const initialState = { activeStep: 0 };

describe('useStepBar', () => {
  it('Should update active step', async () => {
    const { result } = renderHooks(0);

    expect(result.current.stepBarInternal).toEqual(initialState);

    await act(async () => {
      result.current.nextStep();
    });

    expect(result.current.stepBarInternal).toEqual({ activeStep: 1 });

    await act(async () => {
      result.current.prevStep();
    });

    expect(result.current.stepBarInternal).toEqual(initialState);

    await act(async () => {
      result.current.setStep(8);
    });

    expect(result.current.stepBarInternal).toEqual({ activeStep: 8 });

    await act(async () => {
      result.current.reset();
    });

    expect(result.current.stepBarInternal).toEqual({ activeStep: 0 });
  });
});
