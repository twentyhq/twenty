import axios from 'axios';

import { getTokenPair } from '@/apollo/utils/getTokenPair';
import { AgentChatMessageRole } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/constants/agent-chat-message-role';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

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

const apiClient = axios.create({
  baseURL: `${REACT_APP_SERVER_BASE_URL}/rest/agent-chat`,
});

apiClient.interceptors.request.use((config) => {
  const token = getTokenPair()?.accessToken.token;
  if (token !== undefined && token !== null) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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
  ): Promise<string> => {
    const response = await fetch(
      `${REACT_APP_SERVER_BASE_URL}/rest/agent-chat/stream`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getTokenPair()?.accessToken.token}`,
        },
        body: JSON.stringify({
          threadId,
          userMessage,
        }),
      },
    );

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let accumulated = '';

    if (reader !== undefined && reader !== null) {
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
  },
};
