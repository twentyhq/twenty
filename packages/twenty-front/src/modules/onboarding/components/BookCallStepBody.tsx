import { BookCallEmbed } from '@/onboarding/components/BookCallEmbed';
import { OnboardingStepAnimatedItem } from '@/onboarding/components/OnboardingStepAnimatedItem';
import { StyledOnboardingStepHeading } from '@/onboarding/components/StyledOnboardingStepHeading';
import { StyledOnboardingStepSubtitle } from '@/onboarding/components/StyledOnboardingStepSubtitle';
import { StyledOnboardingStepTitle } from '@/onboarding/components/StyledOnboardingStepTitle';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';

const StyledEmbed = styled(OnboardingStepAnimatedItem)`
  display: flex;
  flex: 1;
  justify-content: center;
  min-height: 0;
  overflow: hidden;
  width: 100%;
`;

type BookCallStepBodyProps = {
  calendarBookingPageId: string | null;
  date?: string;
};

export const BookCallStepBody = ({
  calendarBookingPageId,
  date,
}: BookCallStepBodyProps) => {
  const { t } = useLingui();

  return (
    <>
      <StyledOnboardingStepHeading>
        <OnboardingStepAnimatedItem index={0}>
          <StyledOnboardingStepTitle>{t`Talk to our team`}</StyledOnboardingStepTitle>
        </OnboardingStepAnimatedItem>
        <OnboardingStepAnimatedItem index={1}>
          <StyledOnboardingStepSubtitle>
            {t`Book a 15-minute call and we'll help you get your workspace production-ready.`}
          </StyledOnboardingStepSubtitle>
        </OnboardingStepAnimatedItem>
      </StyledOnboardingStepHeading>

      {isNonEmptyString(calendarBookingPageId) && (
        <StyledEmbed index={2}>
          <BookCallEmbed
            calendarBookingPageId={calendarBookingPageId}
            date={date}
          />
        </StyledEmbed>
      )}
    </>
  );
};
