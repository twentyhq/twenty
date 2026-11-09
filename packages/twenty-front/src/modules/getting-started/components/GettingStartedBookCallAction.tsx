import { calendarBookingPageIdState } from '@/client-config/states/calendarBookingPageIdState';
import { useUpdateGettingStarted } from '@/getting-started/hooks/useUpdateGettingStarted';
import { BookCallEmbed } from '@/onboarding/components/BookCallEmbed';
import { BookCallBookingSuccessEffect } from '@/onboarding/effect-components/BookCallBookingSuccessEffect';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { useEffect, useRef, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';
import { GettingStartedStepActionKey } from '~/generated-metadata/graphql';

const MIN_HEIGHT_PX = 300;
// Card body and page bottom paddings, so the step ends at the bottom of the screen.
const SPACE_BELOW_PX = 64;

const StyledScrollArea = styled.div<{ height: number | null }>`
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  height: ${({ height }) => (isDefined(height) ? `${height}px` : 'auto')};
  overflow-y: auto;
`;

export const GettingStartedBookCallAction = () => {
  const calendarBookingPageId = useAtomStateValue(calendarBookingPageIdState);
  const { updateGettingStarted } = useUpdateGettingStarted();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | null>(null);

  useEffect(() => {
    const updateHeight = () => {
      const top = scrollAreaRef.current?.getBoundingClientRect().top;

      if (isDefined(top)) {
        setHeight(
          Math.max(MIN_HEIGHT_PX, window.innerHeight - top - SPACE_BELOW_PX),
        );
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);

    return () => window.removeEventListener('resize', updateHeight);
  }, [calendarBookingPageId]);

  if (!isNonEmptyString(calendarBookingPageId)) {
    return null;
  }

  return (
    <StyledScrollArea ref={scrollAreaRef} height={height}>
      <BookCallBookingSuccessEffect
        onBookingSuccessful={() =>
          void updateGettingStarted({
            completedStepActionKey: GettingStartedStepActionKey.BOOK_CALL,
          })
        }
      />
      <BookCallEmbed calendarBookingPageId={calendarBookingPageId} />
    </StyledScrollArea>
  );
};
