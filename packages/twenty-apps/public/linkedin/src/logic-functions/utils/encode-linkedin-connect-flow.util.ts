import { type LinkedinConnectFlow } from 'src/logic-functions/types/linkedin-connect-flow.type';
import { signLinkedinConnectFlow } from 'src/logic-functions/utils/sign-linkedin-connect-flow.util';

export const encodeLinkedinConnectFlow = (
  flow: LinkedinConnectFlow,
): string => {
  const encodedFlow = Buffer.from(JSON.stringify(flow)).toString('base64url');

  return `${encodedFlow}.${signLinkedinConnectFlow(encodedFlow).toString('base64url')}`;
};
