import { calendarBookingPageIdState } from '@/client-config/states/calendarBookingPageIdState';
import { GettingStartedBookCallPreview } from '@/getting-started/components/GettingStartedBookCallPreview';
import { useUpdateGettingStarted } from '@/getting-started/hooks/useUpdateGettingStarted';
import { BookCallStepBody } from '@/onboarding/components/BookCallStepBody';
import { BookCallBookingSuccessEffect } from '@/onboarding/effect-components/BookCallBookingSuccessEffect';
import { useFullScreenModal } from '@/ui/layout/fullscreen/hooks/useFullScreenModal';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme';
import { GettingStartedStepActionKey } from '~/generated-metadata/graphql';

const StyledBookingPage = styled.div`
  align-items: center;
  gap: ${themeCssVariables.spacing[5]};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[8]};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[1]};
  }
`;

type BookingPage = { dayKey?: string };

export const GettingStartedBookCallAction = () => {
  const { t } = useLingui();
  const calendarBookingPageId = useAtomStateValue(calendarBookingPageIdState);
  const { updateGettingStarted } = useUpdateGettingStarted();
  const [openedBookingPage, setOpenedBookingPage] =
    useState<BookingPage | null>(null);

  const { renderFullScreenModal } = useFullScreenModal({
    links: [{ children: t`Getting started` }, { children: t`Book a call` }],
    onClose: () => setOpenedBookingPage(null),
  });

  const handleBookingSuccessful = () => {
    setOpenedBookingPage(null);
    void updateGettingStarted({
      completedStepActionKey: GettingStartedStepActionKey.BOOK_CALL,
    });
  };

  if (!isNonEmptyString(calendarBookingPageId)) {
    return null;
  }

  return (
    <>
      <GettingStartedBookCallPreview
        calendarBookingPageId={calendarBookingPageId}
        onOpenBookingPage={(dayKey) => setOpenedBookingPage({ dayKey })}
      />
      {renderFullScreenModal(
        <StyledBookingPage>
          <BookCallBookingSuccessEffect
            onBookingSuccessful={handleBookingSuccessful}
          />
          <BookCallStepBody
            calendarBookingPageId={calendarBookingPageId}
            date={openedBookingPage?.dayKey}
          />
        </StyledBookingPage>,
        openedBookingPage !== null,
      )}
    </>
  );
};
