import { useCallback, useEffect } from 'react';
import { useRecoilState } from 'recoil';

import { stepBarInternalState } from '../states/stepBarInternalState';

export type StepsOptions = {
  initialStep: number;
};

export function useStepBar({ initialStep }: StepsOptions) {
  const [stepsState, setStepsState] = useRecoilState(stepBarInternalState);

  function nextStep() {
    setStepsState((prevState) => ({
      ...prevState,
      activeStep: prevState.activeStep + 1,
    }));
  }

  function prevStep() {
    setStepsState((prevState) => ({
      ...prevState,
      activeStep: prevState.activeStep - 1,
    }));
  }

  function reset() {
    setStepsState((prevState) => ({
      ...prevState,
      activeStep: 0,
    }));
  }

  const setStep = useCallback(
    (step: number) => {
      setStepsState((prevState) => ({
        ...prevState,
        activeStep: step,
      }));
    },
    [setStepsState],
  );

  useEffect(() => {
    if (initialStep !== undefined) {
      setStep(initialStep);
    }
    // We only want this to happen on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    nextStep,
    prevStep,
    reset,
    setStep,
    activeStep: stepsState.activeStep,
  };
}
