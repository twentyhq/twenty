import { isDefined } from 'twenty-sdk/utils';

import { GOOGLE_DOC_UNREADABLE_STATUSES } from 'src/logic-functions/constants/google-docs-api.constant';
import { GoogleMeetException } from 'src/logic-functions/types/google-meet-exception.type';

export const isGoogleDocUnreadableError = (error: unknown): boolean =>
  error instanceof GoogleMeetException &&
  isDefined(error.httpStatus) &&
  GOOGLE_DOC_UNREADABLE_STATUSES.has(error.httpStatus);
