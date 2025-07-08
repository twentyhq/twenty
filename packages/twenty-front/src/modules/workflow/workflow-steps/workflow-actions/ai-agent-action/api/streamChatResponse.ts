import { getTokenPair } from '@/apollo/utils/getTokenPair';
import { renewToken } from '@/auth/services/AuthService';
import { AppPath } from '@/types/AppPath';
import { isDefined } from 'twenty-shared/utils';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { cookieStorage } from '~/utils/cookie-storage';

const handleTokenRenewal = async () => {
  const tokenPair = getTokenPair();
  if (!isDefined(tokenPair?.refreshToken?.token)) {
    throw new Error('No refresh token available');
  }

  const newTokens = await renewToken(
    `${REACT_APP_SERVER_BASE_URL}/graphql`,
    tokenPair,
  );

  if (!isDefined(newTokens)) {
    throw new Error('Token renewal failed');
  }

  cookieStorage.setItem('tokenPair', JSON.stringify(newTokens));
  return newTokens;
};

const createStreamRequest = (
  threadId: string,
  userMessage: string,
  accessToken: string,
) => ({
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
  },
  body: JSON.stringify({
    threadId,
    userMessage,
  }),
});

const handleStreamResponse = async (
  response: Response,
  onChunk: (chunk: string) => void,
): Promise<string> => {
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let accumulated = '';

  if (isDefined(reader)) {
    let done = false;
    while (!done) {
      const { value, done: isDone } = await reader.read();
      done = isDone;
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      accumulated += chunk;
      onChunk(accumulated);
    }
  }

  return accumulated;
};

export const streamChatResponse = async (
  threadId: string,
  userMessage: string,
  onChunk: (chunk: string) => void,
) => {
  const tokenPair = getTokenPair();

  if (!isDefined(tokenPair?.accessToken?.token)) {
    throw new Error('No access token available');
  }

  const accessToken = tokenPair.accessToken.token;

  const response = await fetch(
    `${REACT_APP_SERVER_BASE_URL}/rest/agent-chat/stream`,
    createStreamRequest(threadId, userMessage, accessToken),
  );

  if (response.ok) {
    return handleStreamResponse(response, onChunk);
  }

  if (response.status === 401) {
    try {
      const newTokens = await handleTokenRenewal();
      const retryResponse = await fetch(
        `${REACT_APP_SERVER_BASE_URL}/rest/agent-chat/stream`,
        createStreamRequest(threadId, userMessage, newTokens.accessToken.token),
      );

      if (retryResponse.ok) {
        return handleStreamResponse(retryResponse, onChunk);
      }
    } catch (renewalError) {
      window.location.href = AppPath.SignInUp;
    }
    throw new Error('Authentication failed');
  }
};
