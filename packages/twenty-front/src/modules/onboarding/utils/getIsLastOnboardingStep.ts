import {
  type GetNextOnboardingStatusArgs,
  getNextOnboardingStatus,
} from '@/onboarding/utils/getNextOnboardingStatus';
import { OnboardingStatus } from '~/generated-metadata/graphql';

// The plan step is always the last one: checkout completes it outside of the
// step sequence, so it never advances to COMPLETED here.
export const getIsLastOnboardingStep = (args: GetNextOnboardingStatusArgs) =>
  args.currentUser?.onboardingStatus === OnboardingStatus.PLAN_REQUIRED ||
  getNextOnboardingStatus(args) === OnboardingStatus.COMPLETED;
