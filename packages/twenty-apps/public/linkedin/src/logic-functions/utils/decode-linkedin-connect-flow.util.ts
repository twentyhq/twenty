import { timingSafeEqual } from 'node:crypto';

import { isNonEmptyString } from '@sniptt/guards';

import { type LinkedinConnectFlow } from 'src/logic-functions/types/linkedin-connect-flow.type';
import { signLinkedinConnectFlow } from 'src/logic-functions/utils/sign-linkedin-connect-flow.util';

export const decodeLinkedinConnectFlow = (
  flowToken: string | undefined,
): LinkedinConnectFlow | null => {
  if (!isNonEmptyString(flowToken)) {
    return null;
  }

  const [encodedFlow, encodedSignature] = flowToken.split('.');

  if (!isNonEmptyString(encodedFlow) || !isNonEmptyString(encodedSignature)) {
    return null;
  }

  const expectedSignature = signLinkedinConnectFlow(encodedFlow);
  const receivedSignature = Buffer.from(encodedSignature, 'base64url');

  if (
    receivedSignature.length !== expectedSignature.length ||
    !timingSafeEqual(receivedSignature, expectedSignature)
  ) {
    return null;
  }

  const flow: LinkedinConnectFlow = JSON.parse(
    Buffer.from(encodedFlow, 'base64url').toString('utf-8'),
  );

  return flow.expiresAtMs > Date.now() ? flow : null;
};
