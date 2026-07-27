import { SUPPORTED_MEETING_PLATFORM_URL_PATTERNS } from 'src/logic-functions/constants/supported-meeting-platform-url-patterns';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

// Outlook HTML bodies encode ampersands; plain-text links can end mid-sentence.
const cleanExtractedConferenceLinkUrl = (url: string): string =>
  url.replace(/&amp;/gi, '&').replace(/[.,;:!?)\]]+$/, '');

export const extractConferenceLinkUrlFromText = (
  text: string | null | undefined,
): string | undefined => {
  if (!isNonEmptyString(text)) {
    return undefined;
  }

  for (const pattern of SUPPORTED_MEETING_PLATFORM_URL_PATTERNS) {
    const match = text.match(pattern);

    if (match !== null) {
      return cleanExtractedConferenceLinkUrl(match[0]);
    }
  }

  return undefined;
};
