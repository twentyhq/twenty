import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

export const parseTeamsTranscriptResource = (
  resource: unknown,
): { meetingId: string; transcriptId: string } | undefined => {
  if (!isNonEmptyString(resource)) {
    return undefined;
  }

  const match =
    /^\/?users\/[^/]+\/onlineMeetings\('([^']+)'\)\/transcripts\('([^']+)'\)$/.exec(
      resource,
    ) ??
    /^\/?users\('[^']+'\)\/onlineMeetings\('([^']+)'\)\/transcripts\('([^']+)'\)$/.exec(
      resource,
    ) ??
    /^\/?users\/[^/]+\/onlineMeetings\/([^/]+)\/transcripts\/([^/]+)$/.exec(
      resource,
    );

  if (!isDefined(match)) {
    return undefined;
  }

  const [, encodedMeetingId, encodedTranscriptId] = match;

  try {
    return {
      meetingId: decodeURIComponent(encodedMeetingId),
      transcriptId: decodeURIComponent(encodedTranscriptId),
    };
  } catch {
    return undefined;
  }
};
