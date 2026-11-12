import { type CalEventTypeReference } from '@/getting-started/types/CalEventTypeReference';
import { isNonEmptyString } from '@sniptt/guards';

export const getCalEventTypeReference = (
  calendarBookingPageId: string,
): CalEventTypeReference | null => {
  const [owner, teamSlugOrEventTypeSlug, teamEventTypeSlug, ...extraSegments] =
    calendarBookingPageId.split('/').filter(isNonEmptyString);

  if (
    extraSegments.length > 0 ||
    !isNonEmptyString(owner) ||
    !isNonEmptyString(teamSlugOrEventTypeSlug)
  ) {
    return null;
  }

  if (owner === 'team') {
    return isNonEmptyString(teamEventTypeSlug)
      ? { teamSlug: teamSlugOrEventTypeSlug, eventTypeSlug: teamEventTypeSlug }
      : null;
  }

  return isNonEmptyString(teamEventTypeSlug)
    ? null
    : { username: owner, eventTypeSlug: teamSlugOrEventTypeSlug };
};
