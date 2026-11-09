import { isNonEmptyString } from '@sniptt/guards';

import { type GettingStartedProfile } from 'src/engine/core-modules/getting-started/types/getting-started-profile.type';
import { isBookCallQualified } from 'src/engine/core-modules/onboarding/utils/is-book-call-qualified.util';

export const isGettingStartedBookCallOffered = ({
  profile,
  calendarBookingPageId,
  minEmployeeCount,
  employeeCount,
}: {
  profile: GettingStartedProfile;
  calendarBookingPageId: string | undefined;
  minEmployeeCount: number | null;
  employeeCount: number | null | undefined;
}): boolean =>
  isNonEmptyString(calendarBookingPageId) &&
  (profile === 'TEAM' ||
    isBookCallQualified({ minEmployeeCount, employeeCount }));
