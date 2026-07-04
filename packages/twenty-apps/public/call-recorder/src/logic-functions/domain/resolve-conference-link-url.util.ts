import { extractConferenceLinkUrlFromText } from 'src/logic-functions/domain/extract-conference-link-url-from-text.util';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

type ResolveConferenceLinkUrlInput = {
  conferenceLinkUrl: string | null | undefined;
  location: string | null | undefined;
  description: string | null | undefined;
};

// The server only fills conferenceLink when the calendar provider exposes a
// structured conference field (Google Meet, Teams, or add-on-scheduled
// meetings). Zoom and other third-party links usually only exist as plain
// text in the event location or description, so we parse them out as a
// fallback — the structured link keeps precedence.
export const resolveConferenceLinkUrl = ({
  conferenceLinkUrl,
  location,
  description,
}: ResolveConferenceLinkUrlInput): string | undefined => {
  if (isNonEmptyString(conferenceLinkUrl)) {
    return conferenceLinkUrl;
  }

  return (
    extractConferenceLinkUrlFromText(location) ??
    extractConferenceLinkUrlFromText(description)
  );
};
