import { isNonEmptyString } from '@sniptt/guards';
import {
  DEFAULT_API_URL_NAME,
  DEFAULT_APP_ACCESS_TOKEN_NAME,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

const ENQUEUE_LOGIC_FUNCTION_TIMEOUT_MS = 10_000;

export type EnqueueLogicFunctionExecutionParams = {
  name?: string;
  universalIdentifier?: string;
  payload: Record<string, unknown>;
};

export type EnqueueLogicFunctionExecutionResult = {
  jobId: string;
  status: 'queued';
};

export const enqueueLogicFunctionExecution = async (
  params: EnqueueLogicFunctionExecutionParams,
): Promise<EnqueueLogicFunctionExecutionResult> => {
  const apiUrl = process.env[DEFAULT_API_URL_NAME];
  const token = process.env[DEFAULT_APP_ACCESS_TOKEN_NAME];

  if (!apiUrl || !token) {
    throw new Error(
      'enqueueLogicFunctionExecution requires TWENTY_API_URL and TWENTY_APP_ACCESS_TOKEN',
    );
  }

  const hasUniversalIdentifier = isDefined(params.universalIdentifier);
  const hasName = isNonEmptyString(params.name);

  if (hasUniversalIdentifier === hasName) {
    throw new Error(
      'enqueueLogicFunctionExecution: provide exactly one of name or universalIdentifier',
    );
  }

  const response = await fetch(
    `${apiUrl.replace(/\/$/, '')}/app/logic-functions/enqueue`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...(hasName ? { name: params.name } : {}),
        ...(hasUniversalIdentifier
          ? { universalIdentifier: params.universalIdentifier }
          : {}),
        payload: params.payload,
      }),
      signal: AbortSignal.timeout(ENQUEUE_LOGIC_FUNCTION_TIMEOUT_MS),
    },
  );

  if (!response.ok) {
    const body = await response.text().catch(() => '');

    throw new Error(
      `enqueueLogicFunctionExecution failed: ${response.status} ${response.statusText} ${body}`,
    );
  }

  return response.json() as Promise<EnqueueLogicFunctionExecutionResult>;
};
