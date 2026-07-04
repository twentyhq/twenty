import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

// Ordered by provider precedence: the first matching provider wins (e.g. a
// pasted Zoom invitation beats an auto-added Meet link).
const CONFERENCE_LINK_URL_PATTERNS: RegExp[] = [
  /https:\/\/(?:[\w-]+\.)*(?:zoom\.us|zoomgov\.com)\/(?:j|my|s|w|wc\/join)\/[^\s"'<>\\]+/i,
  /https:\/\/meet\.google\.com\/[^\s"'<>\\]+/i,
  /https:\/\/teams\.(?:microsoft|live)\.com\/(?:l\/meetup-join|meet)\/[^\s"'<>\\]+/i,
  /https:\/\/(?:[\w-]+\.)*webex\.com\/(?:meet\/|join\/|[\w-]+\/j\.php\?)[^\s"'<>\\]+/i,
  /https:\/\/(?:[\w-]+\.)*(?:gotomeeting\.com\/join|gotomeet\.me)\/[^\s"'<>\\]+/i,
];

// Outlook HTML bodies encode ampersands; plain-text links can end mid-sentence.
const cleanExtractedConferenceLinkUrl = (url: string): string =>
  url.replace(/&amp;/gi, '&').replace(/[.,;:!?)\]]+$/, '');

export const extractConferenceLinkUrlFromText = (
  text: string | null | undefined,
): string | undefined => {
  if (!isNonEmptyString(text)) {
    return undefined;
  }

  for (const pattern of CONFERENCE_LINK_URL_PATTERNS) {
    const match = text.match(pattern);

    if (match !== null) {
      return cleanExtractedConferenceLinkUrl(match[0]);
    }
  }

  return undefined;
};
