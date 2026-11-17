import { isNonEmptyString } from '@sniptt/guards';

export const extractGoogleMeetNameFromDocTitle = (
  docTitle: string | undefined,
): string | undefined => {
  if (!isNonEmptyString(docTitle)) {
    return undefined;
  }

  const suffixStart = docTitle.lastIndexOf(' - ');
  const meetingName = (
    suffixStart === -1 ? docTitle : docTitle.slice(0, suffixStart)
  ).trim();

  return isNonEmptyString(meetingName) ? meetingName : undefined;
};
