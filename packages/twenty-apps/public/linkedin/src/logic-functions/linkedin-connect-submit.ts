import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { type Response } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { LINKEDIN_CONNECT_ROUTE_PATH } from 'src/constants/linkedin-connect-route-path.constant';
import { LINKEDIN_CONNECT_SUBMIT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { type LinkedinConnectFlow } from 'src/logic-functions/types/linkedin-connect-flow.type';
import { type LinkedinConnectPendingCheckpoint } from 'src/logic-functions/types/linkedin-connect-pending-checkpoint.type';
import { buildLinkedinConnectHtmlResponse } from 'src/logic-functions/utils/build-linkedin-connect-html-response.util';
import { buildLinkedinConnectResultResponse } from 'src/logic-functions/utils/build-linkedin-connect-result-response.util';
import { decodeLinkedinConnectFlow } from 'src/logic-functions/utils/decode-linkedin-connect-flow.util';
import { getForwardedPublicIpv4 } from 'src/logic-functions/utils/get-forwarded-public-ipv4.util';
import { parseLinkedinConnectSubmission } from 'src/logic-functions/utils/parse-linkedin-connect-submission.util';
import { renderLinkedinConnectExpired } from 'src/logic-functions/utils/render-linkedin-connect-expired.util';
import { renderLinkedinConnectSignIn } from 'src/logic-functions/utils/render-linkedin-connect-sign-in.util';
import { UNIPILE_INVALID_CREDENTIALS_ERROR_TYPE } from 'src/unipile/constants/unipile-invalid-credentials-error-type.constant';
import { type UnipileAuthIntentResult } from 'src/unipile/types/unipile-auth-intent-result.type';
import { UnipileRequestError } from 'src/unipile/utils/request-unipile.util';
import { solveUnipileCheckpoint } from 'src/unipile/utils/solve-unipile-checkpoint.util';
import { startUnipileLinkedinAuthIntent } from 'src/unipile/utils/start-unipile-linkedin-auth-intent.util';
import { waitForUnipileCheckpoint } from 'src/unipile/utils/wait-for-unipile-checkpoint.util';

const LINKEDIN_CONNECT_SUBMIT_TIMEOUT_SECONDS = 60;

const LINKEDIN_CONNECT_APPROVAL_WAIT_MILLISECONDS = 20 * 1000;

const LINKEDIN_CONNECT_RATE_LIMIT_WAIT_BUDGET_MILLISECONDS = 10 * 1000;

const toPendingResult = ({
  intentId,
  checkpoint,
}: LinkedinConnectPendingCheckpoint): UnipileAuthIntentResult => ({
  object: 'AuthenticationCheckpoint',
  intent_id: intentId,
  checkpoint,
});

const buildSignInResponse = ({
  flow,
  username,
  errorMessage,
}: {
  flow: LinkedinConnectFlow;
  username?: string;
  errorMessage: string;
}): Response =>
  buildLinkedinConnectHtmlResponse({
    page: renderLinkedinConnectSignIn({ flow, username, errorMessage }),
  });

const respondToUnipileFailure = async ({
  respond,
  respondToFailure,
}: {
  respond: () => Promise<Response>;
  respondToFailure: (error: UnipileRequestError) => Promise<Response>;
}): Promise<Response> => {
  try {
    return await respond();
  } catch (error) {
    if (!(error instanceof UnipileRequestError)) {
      throw error;
    }

    console.error(`[linkedin] ${error.message}`);

    return respondToFailure(error);
  }
};

const signIn = async ({
  flow,
  username,
  password,
  endUserIp,
  deadlineAtMs,
}: {
  flow: LinkedinConnectFlow;
  username: string | undefined;
  password: string | undefined;
  endUserIp: string | undefined;
  deadlineAtMs: number;
}): Promise<Response> => {
  if (!isNonEmptyString(username) || !isNonEmptyString(password)) {
    return buildSignInResponse({
      flow,
      username,
      errorMessage: 'Enter your email or phone and your password.',
    });
  }

  return respondToUnipileFailure({
    respond: async () =>
      buildLinkedinConnectResultResponse({
        flow,
        result: await startUnipileLinkedinAuthIntent({
          username: username.trim(),
          password,
          endUserIp,
          deadlineAtMs,
        }),
      }),
    respondToFailure: async ({ type }) =>
      buildSignInResponse({
        flow,
        username,
        errorMessage:
          type === UNIPILE_INVALID_CREDENTIALS_ERROR_TYPE
            ? 'LinkedIn did not accept this email or password.'
            : 'LinkedIn could not sign you in. Try again in a moment.',
      }),
  });
};

const waitForApproval = ({
  flow,
  pendingCheckpoint,
  deadlineAtMs,
}: {
  flow: LinkedinConnectFlow;
  pendingCheckpoint: LinkedinConnectPendingCheckpoint;
  deadlineAtMs: number;
}): Promise<Response> =>
  respondToUnipileFailure({
    respond: async () => {
      const result = await waitForUnipileCheckpoint({
        intentId: pendingCheckpoint.intentId,
        timeoutMilliseconds: LINKEDIN_CONNECT_APPROVAL_WAIT_MILLISECONDS,
        deadlineAtMs,
      });

      return buildLinkedinConnectResultResponse({
        flow,
        result: result ?? toPendingResult(pendingCheckpoint),
        errorMessage: isDefined(result)
          ? undefined
          : 'LinkedIn has not confirmed the approval yet.',
      });
    },
    respondToFailure: async () =>
      buildSignInResponse({
        flow,
        errorMessage: 'LinkedIn did not confirm the sign-in. Sign in again.',
      }),
  });

const solveCode = async ({
  flow,
  pendingCheckpoint,
  code,
  deadlineAtMs,
}: {
  flow: LinkedinConnectFlow;
  pendingCheckpoint: LinkedinConnectPendingCheckpoint;
  code: string | undefined;
  deadlineAtMs: number;
}): Promise<Response> => {
  if (!isNonEmptyString(code)) {
    return buildLinkedinConnectResultResponse({
      flow,
      result: toPendingResult(pendingCheckpoint),
      errorMessage: 'Enter the verification code.',
    });
  }

  return respondToUnipileFailure({
    respond: async () =>
      buildLinkedinConnectResultResponse({
        flow,
        result: await solveUnipileCheckpoint({
          intentId: pendingCheckpoint.intentId,
          code: code.trim(),
          deadlineAtMs,
        }),
      }),
    respondToFailure: () =>
      buildLinkedinConnectResultResponse({
        flow,
        result: toPendingResult(pendingCheckpoint),
        errorMessage:
          'LinkedIn did not accept this code. Check it and try again, or start over.',
      }),
  });
};

export const linkedinConnectSubmitHandler = async ({
  body,
  headers,
}: Pick<RoutePayload, 'body' | 'headers'>): Promise<Response> => {
  const submission = parseLinkedinConnectSubmission(body);
  const flow = decodeLinkedinConnectFlow(submission.flow);

  if (!isDefined(flow)) {
    return buildLinkedinConnectHtmlResponse({
      page: renderLinkedinConnectExpired(),
      status: 400,
    });
  }

  const deadlineAtMs =
    Date.now() + LINKEDIN_CONNECT_RATE_LIMIT_WAIT_BUDGET_MILLISECONDS;
  const { pendingCheckpoint } = flow;

  if (!isDefined(pendingCheckpoint)) {
    return signIn({
      flow,
      username: submission.username,
      password: submission.password,
      endUserIp: getForwardedPublicIpv4(headers['x-forwarded-for']),
      deadlineAtMs,
    });
  }

  return submission.action === 'wait'
    ? waitForApproval({ flow, pendingCheckpoint, deadlineAtMs })
    : solveCode({
        flow,
        pendingCheckpoint,
        code: submission.code,
        deadlineAtMs,
      });
};

export default defineLogicFunction({
  universalIdentifier: LINKEDIN_CONNECT_SUBMIT_UNIVERSAL_IDENTIFIER,
  name: 'linkedin-connect-submit',
  description:
    'Signs a member in to LinkedIn through Unipile from the connect page, one verification step at a time.',
  timeoutSeconds: LINKEDIN_CONNECT_SUBMIT_TIMEOUT_SECONDS,
  handler: linkedinConnectSubmitHandler,
  httpRouteTriggerSettings: {
    path: LINKEDIN_CONNECT_ROUTE_PATH,
    httpMethod: 'POST',
    isAuthRequired: false,
    forwardedRequestHeaders: ['x-forwarded-for'],
  },
});
