import {
  type GetNextOnboardingStatusArgs,
  getNextOnboardingStatus,
} from '@/onboarding/utils/getNextOnboardingStatus';
import { OnboardingStatus } from '~/generated-metadata/graphql';

export const getIsLastOnboardingStep = (args: GetNextOnboardingStatusArgs) =>
  args.currentUser?.onboardingStatus === OnboardingStatus.PLAN_REQUIRED ||
  getNextOnboardingStatus(args) === OnboardingStatus.COMPLETED;
