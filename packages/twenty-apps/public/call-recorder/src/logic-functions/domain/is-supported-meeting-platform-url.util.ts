import { SUPPORTED_MEETING_PLATFORM_URL_PATTERNS } from 'src/logic-functions/constants/supported-meeting-platform-url-patterns';
import { isNonEmptyString } from '@twentyhq/recall-utils/utils/is-non-empty-string.util';

export const isSupportedMeetingPlatformUrl = (
  url: string | null | undefined,
): boolean => {
  if (!isNonEmptyString(url)) {
    return false;
  }

  return SUPPORTED_MEETING_PLATFORM_URL_PATTERNS.some((pattern) =>
    pattern.test(url),
  );
};
