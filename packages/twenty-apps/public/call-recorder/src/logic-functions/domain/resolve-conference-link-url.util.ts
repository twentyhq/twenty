import { extractConferenceLinkUrlFromText } from 'src/logic-functions/domain/extract-conference-link-url-from-text.util';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

type ResolveConferenceLinkUrlInput = {
  conferenceLinkUrl: string | null | undefined;
  location: string | null | undefined;
  description: string | null | undefined;
};

// The server only fills conferenceLink from structured provider data; Zoom and
// other third-party links often exist only as text in location/description.
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
