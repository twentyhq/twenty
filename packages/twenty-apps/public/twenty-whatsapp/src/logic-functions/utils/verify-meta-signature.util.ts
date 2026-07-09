import { createHmac, timingSafeEqual } from 'node:crypto';

import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

const SIGNATURE_PREFIX = 'sha256=';

export const verifyMetaSignature = ({
  rawBody,
  signatureHeader,
  appSecret,
}: {
  rawBody: string;
  signatureHeader: string | undefined;
  appSecret: string;
}): boolean => {
  if (
    !isNonEmptyString(signatureHeader) ||
    !signatureHeader.startsWith(SIGNATURE_PREFIX)
  ) {
    return false;
  }

  const providedSignature = signatureHeader.slice(SIGNATURE_PREFIX.length);
  const expectedSignature = createHmac('sha256', appSecret)
    .update(rawBody, 'utf8')
    .digest('hex');

  if (providedSignature.length !== expectedSignature.length) {
    return false;
  }

  return timingSafeEqual(
    Buffer.from(providedSignature, 'utf8'),
    Buffer.from(expectedSignature, 'utf8'),
  );
};
