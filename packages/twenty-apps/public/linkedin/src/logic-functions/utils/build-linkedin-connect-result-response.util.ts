import { type Response } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { LINKEDIN_CONNECT_SCREEN_BY_CHECKPOINT_TYPE } from 'src/constants/linkedin-connect-screen-by-checkpoint-type.constant';
import { type LinkedinConnectFlow } from 'src/logic-functions/types/linkedin-connect-flow.type';
import { buildLinkedinConnectHtmlResponse } from 'src/logic-functions/utils/build-linkedin-connect-html-response.util';
import { renderLinkedinConnectApproval } from 'src/logic-functions/utils/render-linkedin-connect-approval.util';
import { renderLinkedinConnectCode } from 'src/logic-functions/utils/render-linkedin-connect-code.util';
import { renderLinkedinConnectRedirect } from 'src/logic-functions/utils/render-linkedin-connect-redirect.util';
import { type UnipileAuthIntentResult } from 'src/unipile/types/unipile-auth-intent-result.type';
import { createUnipileHostedAuthLink } from 'src/unipile/utils/create-unipile-hosted-auth-link.util';

const buildCallbackUrl = ({
  callbackUrl,
  accountId,
}: {
  callbackUrl: string;
  accountId: string;
}): string => {
  const url = new URL(callbackUrl);

  url.searchParams.set('account_id', accountId);

  return url.toString();
};

const buildHostedSignInResponse = async ({
  callbackUrl,
}: Pick<LinkedinConnectFlow, 'callbackUrl'>): Promise<Response> =>
  buildLinkedinConnectHtmlResponse({
    page: renderLinkedinConnectRedirect({
      title: 'One more step',
      message:
        'LinkedIn asks for an extra security check. Sign in once more on the next page to complete it.',
      url: await createUnipileHostedAuthLink({
        provider: 'linkedin',
        callbackUrl,
      }),
    }),
  });

export const buildLinkedinConnectResultResponse = async ({
  flow,
  result,
  errorMessage,
}: {
  flow: LinkedinConnectFlow;
  result: UnipileAuthIntentResult;
  errorMessage?: string;
}): Promise<Response> => {
  if (result.object === 'Account') {
    return buildLinkedinConnectHtmlResponse({
      page: renderLinkedinConnectRedirect({
        title: 'LinkedIn connected',
        message: 'Taking you back to Twenty.',
        url: buildCallbackUrl({
          callbackUrl: flow.callbackUrl,
          accountId: result.id,
        }),
      }),
    });
  }

  if (result.object !== 'AuthenticationCheckpoint') {
    return buildHostedSignInResponse(flow);
  }

  const screen =
    LINKEDIN_CONNECT_SCREEN_BY_CHECKPOINT_TYPE[result.checkpoint.type];

  if (!isDefined(screen)) {
    return buildHostedSignInResponse(flow);
  }

  const { type, channel, platform, code } = result.checkpoint;
  const checkpoint = { type, channel, platform, code };
  const checkpointFlow = {
    ...flow,
    pendingCheckpoint: { intentId: result.intent_id, checkpoint },
  };

  return buildLinkedinConnectHtmlResponse({
    page:
      screen === 'code'
        ? renderLinkedinConnectCode({
            flow: checkpointFlow,
            checkpoint,
            errorMessage,
          })
        : renderLinkedinConnectApproval({ flow: checkpointFlow, checkpoint }),
  });
};
