import { isNonEmptyString } from '@sniptt/guards';

import { GRAPH_TRANSCRIPT_LIST_PAGE_SIZE } from 'src/constants/teams.constant';

// Graph rejects the function call without the organizer parameter, and the
// date filters are function parameters, not OData filters.
export const buildOrganizerTranscriptsUrl = ({
  organizerUserId,
  startDateTime,
  endDateTime,
}: {
  organizerUserId: string;
  startDateTime?: string;
  endDateTime?: string;
}): string => {
  const functionParameters = [
    `meetingOrganizerUserId='${organizerUserId}'`,
    ...(isNonEmptyString(startDateTime)
      ? [`startDateTime=${startDateTime}`]
      : []),
    ...(isNonEmptyString(endDateTime) ? [`endDateTime=${endDateTime}`] : []),
  ].join(',');

  return `users/${encodeURIComponent(organizerUserId)}/onlineMeetings/getAllTranscripts(${functionParameters})?$top=${GRAPH_TRANSCRIPT_LIST_PAGE_SIZE}`;
};
