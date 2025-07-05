import { getTokenPair } from '@/apollo/utils/getTokenPair';
import { renewToken } from '@/auth/services/AuthService';
import { AgentChatMessageRole } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/constants/agent-chat-message-role';
import axios from 'axios';
import { isDefined } from 'twenty-shared/utils';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { cookieStorage } from '~/utils/cookie-storage';

export interface AgentChatMessage {
  id: string;
  threadId: string;
  role: AgentChatMessageRole;
  content: string;
  createdAt: string;
}

export interface AgentChatThread {
  id: string;
  agentId: string;
  createdAt: string;
  updatedAt: string;
}

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

const apiClient = axios.create({
  baseURL: `${REACT_APP_SERVER_BASE_URL}/rest/agent-chat`,
});

apiClient.interceptors.request.use((config) => {
  const tokenPair = getTokenPair();
  if (isDefined(tokenPair?.accessToken?.token)) {
    config.headers.Authorization = `Bearer ${tokenPair.accessToken.token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        const newTokens = await handleTokenRenewal();
        const originalRequest = error.config;
        originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken.token}`;
        return apiClient(originalRequest);
      } catch (renewalError) {
        window.location.href = '/sign-in';
      }
    }
    return Promise.reject(error);
  },
);

export const agentChatKeys = {
  all: ['agent-chat'] as const,
  threads: (agentId: string) =>
    [...agentChatKeys.all, 'threads', agentId] as const,
  messages: (threadId: string) =>
    [...agentChatKeys.all, 'messages', threadId] as const,
};

export const agentChatApi = {
  getThreads: async (agentId: string): Promise<AgentChatThread[]> => {
    const response = await apiClient.get(`/threads/${agentId}`);
    return response.data;
  },

  getMessages: async (threadId: string): Promise<AgentChatMessage[]> => {
    const response = await apiClient.get(`/messages/${threadId}`);
    return response.data;
  },

  streamResponse: async (
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
          createStreamRequest(
            threadId,
            userMessage,
            newTokens.accessToken.token,
          ),
        );

        if (retryResponse.ok) {
          return handleStreamResponse(retryResponse, onChunk);
        }
      } catch (renewalError) {
        window.location.href = '/sign-in';
      }
      throw new Error('Authentication failed');
    }
  },
};

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
