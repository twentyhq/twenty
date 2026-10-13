import { HttpStatus } from '@nestjs/common';

import { buildUnsubscribeResultPage } from 'src/engine/core-modules/emailing-domain/utils/build-unsubscribe-result-page.util';

export const buildRecipientErrorPage = (statusCode: number): string => {
  switch (statusCode) {
    case HttpStatus.BAD_REQUEST:
      return buildUnsubscribeResultPage(
        'This link is not valid',
        'The link may be incomplete or expired. Open it again from the latest email you received.',
      );
    case HttpStatus.NOT_FOUND:
      return buildUnsubscribeResultPage(
        'Link not found',
        'This link does not exist or is no longer available.',
      );
    case HttpStatus.TOO_MANY_REQUESTS:
      return buildUnsubscribeResultPage(
        'Too many requests',
        'Please wait a minute and try again.',
      );
    default:
      return buildUnsubscribeResultPage(
        'Something went wrong',
        'Please try again later.',
      );
  }
};
