import { useQuery } from '@apollo/client/react';
import { useUpdateGettingStarted } from '@/getting-started/hooks/useUpdateGettingStarted';
import {
  GETTING_STARTED_STEPS,
  type GettingStartedProgress,
  type GettingStartedStep,
} from 'twenty-shared/types';
import { GET_GETTING_STARTED_PROGRESS } from '@/getting-started/graphql/gettingStarted';
import { getNextGettingStartedStep } from '@/getting-started/utils/getNextGettingStartedStep';

type ProgressQuery = { gettingStartedProgress: GettingStartedProgress };
export const useGettingStarted = ({
  enabled = true,
}: { enabled?: boolean } = {}) => {
  const { data, loading, error, refetch } = useQuery<ProgressQuery>(
    GET_GETTING_STARTED_PROGRESS,
    { skip: !enabled, fetchPolicy: 'cache-first' },
  );
  const { update, saving } = useUpdateGettingStarted();
  const completedSteps = data?.gettingStartedProgress.completedSteps ?? [];
  const currentStep =
    GETTING_STARTED_STEPS.find((step) => !completedSteps.includes(step)) ??
    GETTING_STARTED_STEPS[0];
  const selectedStep = data?.gettingStartedProgress.selectedStep ?? currentStep;
  const nextStep = getNextGettingStartedStep(selectedStep, completedSteps);
  return {
    progress: data?.gettingStartedProgress,
    completedSteps,
    currentStep,
    selectedStep,
    isComplete: completedSteps.length === GETTING_STARTED_STEPS.length,
    loading,
    saving,
    error,
    refetch,
    selectStep: (step: GettingStartedStep) => update({ selectedStep: step }),
    completeStep: (step: GettingStartedStep) => update({ completedStep: step }),
    skip: () => update({ selectedStep: nextStep ?? selectedStep }),
    snooze: (snoozedUntil: string) => update({ snoozedUntil }),
  };
};
