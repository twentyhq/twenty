import { ONBOARDING_CREDIT_WORTH_PER_CREDIT } from '@/onboarding/constants/OnboardingCreditWorthPerCredit';

export const getOnboardingCreditWorth = (credits: number) => ({
  aiActions: Math.floor(credits * ONBOARDING_CREDIT_WORTH_PER_CREDIT.aiActions),
  workflowSteps: Math.floor(
    credits * ONBOARDING_CREDIT_WORTH_PER_CREDIT.workflowSteps,
  ),
  enrichments: Math.floor(
    credits * ONBOARDING_CREDIT_WORTH_PER_CREDIT.enrichments,
  ),
  callRecordingHours:
    Math.round(
      credits * ONBOARDING_CREDIT_WORTH_PER_CREDIT.callRecordingHours * 10,
    ) / 10,
  emailsSent: Math.floor(
    credits * ONBOARDING_CREDIT_WORTH_PER_CREDIT.emailsSent,
  ),
});
