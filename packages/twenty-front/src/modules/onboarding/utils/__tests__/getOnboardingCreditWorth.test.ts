import { getOnboardingCreditWorth } from '@/onboarding/utils/getOnboardingCreditWorth';

describe('getOnboardingCreditWorth', () => {
  it('should convert one credit into what it pays for on average', () => {
    expect(getOnboardingCreditWorth(1)).toEqual({
      aiActions: 24,
      workflowSteps: 10_000,
      enrichments: 10,
      callRecordingHours: 1,
      emailsSent: 3_000,
    });
  });

  it('should round down partial actions and keep one decimal of call recording', () => {
    expect(getOnboardingCreditWorth(0.33)).toEqual({
      aiActions: 7,
      workflowSteps: 3_300,
      enrichments: 3,
      callRecordingHours: 0.3,
      emailsSent: 990,
    });
  });

  it('should be worth nothing without credits', () => {
    expect(getOnboardingCreditWorth(0)).toEqual({
      aiActions: 0,
      workflowSteps: 0,
      enrichments: 0,
      callRecordingHours: 0,
      emailsSent: 0,
    });
  });
});
