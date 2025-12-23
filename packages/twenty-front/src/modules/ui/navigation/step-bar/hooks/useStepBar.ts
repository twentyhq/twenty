import { useCallback, useEffect } from 'react';
import { useRecoilState } from 'recoil';

import { stepBarInternalState } from '@/ui/navigation/step-bar/states/stepBarInternalState';

export type StepsOptions = {
  initialStep: number;
};

export const useStepBar = ({ initialStep }: StepsOptions) => {
  const [stepBarInternal, setStepBarInternal] =
    useRecoilState(stepBarInternalState);

  const nextStep = () => {
    setStepBarInternal((prevState) => ({
      ...prevState,
      activeStep: prevState.activeStep + 1,
    }));
  };

  const prevStep = () => {
    setStepBarInternal((prevState) => ({
      ...prevState,
      activeStep: prevState.activeStep - 1,
    }));
  };

  const reset = () => {
    setStepBarInternal((prevState) => ({
      ...prevState,
      activeStep: 0,
    }));
  };

  const setStep = useCallback(
    (step: number) => {
      setStepBarInternal((prevState) => ({
        ...prevState,
        activeStep: step,
      }));
    },
    [setStepBarInternal],
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
    activeStep: stepBarInternal.activeStep,
  };
};
