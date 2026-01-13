# Twenty AI Layer Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Integrate Twenty CRM into Smartout AI Layer infrastructure, enabling AI-powered chat with specialized agents for workflows, data management, and context awareness.

**Architecture:** Connect Twenty to `smartout-ai-network` Docker network for access to MCP servers (ctx-mcp, kb-mcp, n8n-mcp). Build React chat widget in twenty-front module with agent router. Implement specialized agents that use MCP tools for workflows, data, and context.

**Tech Stack:** React 18, TypeScript, NestJS, Docker Compose, MCP Protocol, Recoil (state), Emotion (styling)

**Linear Epic:** SMA-49 | **Sub-Epics:** SMA-50 (Infrastructure), SMA-51 (AI Chat), SMA-102 (Bubble Import)

---

## Phase 1: Docker Network Integration (SMA-50)

### Task 1: Connect Twenty to AI Layer Network

**Files:**
- Modify: `docker-compose.override.yml`
- Create: `scripts/test-ai-layer-connection.sh`

**Step 1: Read current docker-compose.override.yml**

Run: `cat docker-compose.override.yml`
Expected: See current override configuration

**Step 2: Update docker-compose.override.yml to join smartout-ai-network**

Replace `docker-compose.override.yml` with:

```yaml
# Override file for Twenty CRM Production
# Connects to smartout-ai-network for AI Layer services

services:
  nginx:
    image: nginx:alpine
    container_name: twenty-nginx
    ports:
      - "3080:80"
      - "3443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      server:
        condition: service_healthy
    networks:
      - default
      - smartout-ai-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://127.0.0.1/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  server:
    networks:
      - default
      - twenty-dev_default
      - smartout-ai-network
    environment:
      # AI Layer Services
      CTX_MCP_URL: http://ctx-mcp:3100
      KB_MCP_URL: http://kb-mcp:3110
      N8N_API_URL: http://n8n:5678
      REDIS_AI_URL: redis://redis:6379

  worker:
    networks:
      - default
      - twenty-dev_default
      - smartout-ai-network

  redis:
    # Use Twenty's own Redis, not AI Layer's

  db:
    # Keep default port 5432

networks:
  twenty-dev_default:
    external: true
  smartout-ai-network:
    external: true
```

**Step 3: Verify network exists**

Run: `docker network ls | grep smartout-ai-network`
Expected: See `smartout-ai-network` in output

**Step 4: Create network if missing**

Run: `docker network create smartout-ai-network 2>/dev/null || echo "Network exists"`
Expected: Network created or already exists

**Step 5: Create connection test script**

Create `scripts/test-ai-layer-connection.sh`:

```bash
#!/bin/bash

# Test connection to AI Layer services from Twenty container

echo "Testing AI Layer connections from Twenty server..."
echo ""

# Test ctx-mcp
echo -n "ctx-mcp (Context Engine): "
if docker exec twenty-server-1 curl -s -o /dev/null -w "%{http_code}" http://ctx-mcp:3100/healthz | grep -q "200"; then
    echo "OK"
else
    echo "FAILED"
fi

# Test kb-mcp
echo -n "kb-mcp (Knowledge Base): "
if docker exec twenty-server-1 curl -s -o /dev/null -w "%{http_code}" http://kb-mcp:3110/health | grep -q "200"; then
    echo "OK"
else
    echo "FAILED"
fi

# Test n8n
echo -n "n8n (Workflow Engine): "
if docker exec twenty-server-1 curl -s -o /dev/null -w "%{http_code}" http://n8n:5678/healthz | grep -q "200"; then
    echo "OK"
else
    echo "FAILED"
fi

echo ""
echo "AI Layer connection test complete."
```

**Step 6: Make script executable**

Run: `chmod +x scripts/test-ai-layer-connection.sh`
Expected: Script is executable

**Step 7: Restart Twenty with new network config**

Run: `docker compose down && docker compose up -d`
Expected: All containers start successfully

**Step 8: Run connection test**

Run: `./scripts/test-ai-layer-connection.sh`
Expected: All services show "OK"

**Step 9: Commit network integration**

Run:
```bash
git add docker-compose.override.yml scripts/test-ai-layer-connection.sh
git commit -m "feat(infra): connect Twenty to smartout-ai-network

- Join smartout-ai-network for AI Layer services
- Add environment variables for MCP endpoints
- Add connection test script

SMA-50: Infrastructure Setup"
```

---

### Task 2: Add Environment Variables for AI Layer

**Files:**
- Modify: `.env.example`
- Modify: `.env`

**Step 1: Add AI Layer variables to .env.example**

Append to `.env.example`:

```bash
# AI Layer Integration
CTX_MCP_URL=http://ctx-mcp:3100
KB_MCP_URL=http://kb-mcp:3110
N8N_API_URL=http://n8n:5678
N8N_API_KEY=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
```

**Step 2: Add AI Layer variables to .env**

Append to `.env`:

```bash
# AI Layer Integration
CTX_MCP_URL=http://ctx-mcp:3100
KB_MCP_URL=http://kb-mcp:3110
N8N_API_URL=http://n8n:5678
N8N_API_KEY=${N8N_API_KEY:-}
OPENAI_API_KEY=${OPENAI_API_KEY:-}
ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY:-}
```

**Step 3: Verify variables added**

Run: `grep "AI Layer" .env`
Expected: See AI Layer section header

**Step 4: Commit environment changes**

Run:
```bash
git add .env.example
git commit -m "feat(config): add AI Layer environment variables

- CTX_MCP_URL for Context Engine
- KB_MCP_URL for Knowledge Base
- N8N_API_URL for workflow automation
- API keys for LLM providers

SMA-54: Environment Variables Alignment"
```

---

## Phase 2: AI Chat Module Structure (SMA-51)

### Task 3: Create AI Chat Module Directory Structure

**Files:**
- Create: `packages/twenty-front/src/modules/ai-chat/` directory structure

**Step 1: Create module directory structure**

Run:
```bash
mkdir -p packages/twenty-front/src/modules/ai-chat/{components,hooks,states,types,utils,constants}
```

Expected: Directories created

**Step 2: Create module index file**

Create `packages/twenty-front/src/modules/ai-chat/index.ts`:

```typescript
// AI Chat Module - Twenty CRM
// Provides AI-powered chat interface with specialized agents

export * from './components/AIChatWidget';
export * from './hooks/useAIChat';
export * from './hooks/useAgentRouter';
export * from './types/chat.types';
export * from './states/chatState';
```

**Step 3: Create type definitions**

Create `packages/twenty-front/src/modules/ai-chat/types/chat.types.ts`:

```typescript
export type AgentType =
  | 'orchestrator'
  | 'workflow'
  | 'data'
  | 'context'
  | 'content';

export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  agent?: AgentType;
  timestamp: Date;
  metadata?: {
    toolCalls?: ToolCall[];
    linkedEntity?: LinkedEntity;
  };
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  result?: unknown;
}

export interface LinkedEntity {
  type: 'company' | 'contact' | 'document';
  id: string;
  name: string;
}

export interface ChatSession {
  id: string;
  workspaceId: string;
  userId: string;
  messages: ChatMessage[];
  activeAgent: AgentType;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentConfig {
  type: AgentType;
  name: string;
  description: string;
  icon: string;
  tools: string[];
  systemPrompt: string;
}
```

**Step 4: Create constants**

Create `packages/twenty-front/src/modules/ai-chat/constants/agents.ts`:

```typescript
import { AgentConfig, AgentType } from '../types/chat.types';

export const AGENT_CONFIGS: Record<AgentType, AgentConfig> = {
  orchestrator: {
    type: 'orchestrator',
    name: 'Orchestrator',
    description: 'Routes requests to specialist agents',
    icon: 'IconRobot',
    tools: ['route_to_agent'],
    systemPrompt: `You are an orchestrator that routes user requests to specialist agents.
Analyze the user's intent and route to:
- workflow: for n8n workflows, automation
- data: for CRM data operations
- context: for questions about people/companies
- content: for writing emails/newsletters`
  },
  workflow: {
    type: 'workflow',
    name: 'Workflow Agent',
    description: 'Creates and manages n8n workflows',
    icon: 'IconGitBranch',
    tools: ['search_nodes', 'n8n_create_workflow', 'validate_workflow'],
    systemPrompt: `You help users create n8n workflows through conversation.
Use search_nodes to find available nodes.
Use n8n_create_workflow to build workflows.
Always validate before saving.`
  },
  data: {
    type: 'data',
    name: 'Data Agent',
    description: 'Manages CRM data',
    icon: 'IconDatabase',
    tools: ['graphql_query', 'graphql_mutation'],
    systemPrompt: `You help users manage CRM data in Twenty.
You can search, create, update, and delete records.
Always confirm before making changes.`
  },
  context: {
    type: 'context',
    name: 'Context Agent',
    description: 'Answers questions about context',
    icon: 'IconUser',
    tools: ['ctx_get_context', 'ctx_get_indices', 'kb_search_documents'],
    systemPrompt: `You answer questions about people, companies, and context.
Use ctx_get_context to get user information.
Use kb_search_documents to find relevant knowledge.`
  },
  content: {
    type: 'content',
    name: 'Content Agent',
    description: 'Writes emails and content',
    icon: 'IconMail',
    tools: ['ctx_get_context', 'send_email'],
    systemPrompt: `You write emails and newsletters.
Match the company's tone and voice.
Always show preview before sending.`
  }
};

export const AGENT_ROUTE_KEYWORDS: Record<AgentType, string[]> = {
  orchestrator: [],
  workflow: ['workflow', 'n8n', 'automate', 'automation', 'trigger', 'when'],
  data: ['create', 'update', 'delete', 'add', 'change', 'record', 'contact', 'company'],
  context: ['who', 'what', 'info', 'about', 'tell me', 'context', 'find'],
  content: ['write', 'email', 'newsletter', 'draft', 'compose', 'send']
};
```

**Step 5: Create Recoil state atoms**

Create `packages/twenty-front/src/modules/ai-chat/states/chatState.ts`:

```typescript
import { atom, selector } from 'recoil';
import { ChatMessage, ChatSession, AgentType } from '../types/chat.types';

export const chatMessagesState = atom<ChatMessage[]>({
  key: 'chatMessagesState',
  default: [],
});

export const activeChatSessionState = atom<ChatSession | null>({
  key: 'activeChatSessionState',
  default: null,
});

export const activeAgentState = atom<AgentType>({
  key: 'activeAgentState',
  default: 'orchestrator',
});

export const chatLoadingState = atom<boolean>({
  key: 'chatLoadingState',
  default: false,
});

export const chatErrorState = atom<string | null>({
  key: 'chatErrorState',
  default: null,
});

export const chatWidgetOpenState = atom<boolean>({
  key: 'chatWidgetOpenState',
  default: false,
});

export const linkedEntityState = atom<{
  type: 'company' | 'contact' | 'document';
  id: string;
  name: string;
} | null>({
  key: 'linkedEntityState',
  default: null,
});

// Selectors
export const lastMessageSelector = selector({
  key: 'lastMessageSelector',
  get: ({ get }) => {
    const messages = get(chatMessagesState);
    return messages[messages.length - 1] || null;
  },
});

export const messageCountSelector = selector({
  key: 'messageCountSelector',
  get: ({ get }) => {
    const messages = get(chatMessagesState);
    return messages.length;
  },
});
```

**Step 6: Commit module structure**

Run:
```bash
git add packages/twenty-front/src/modules/ai-chat/
git commit -m "feat(ai-chat): create module directory structure

- Add types for chat messages, agents, sessions
- Add Recoil state atoms for chat state
- Add agent configurations and routing keywords
- Set up module exports

SMA-108: Chat Interface Sub-Epic"
```

---

### Task 4: Create AI Chat Hook

**Files:**
- Create: `packages/twenty-front/src/modules/ai-chat/hooks/useAIChat.ts`

**Step 1: Create the useAIChat hook**

Create `packages/twenty-front/src/modules/ai-chat/hooks/useAIChat.ts`:

```typescript
import { useCallback } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { v4 as uuidv4 } from 'uuid';

import {
  chatMessagesState,
  chatLoadingState,
  chatErrorState,
  activeAgentState,
  linkedEntityState,
} from '../states/chatState';
import { ChatMessage, AgentType } from '../types/chat.types';
import { AGENT_CONFIGS } from '../constants/agents';

interface SendMessageOptions {
  linkedEntity?: {
    type: 'company' | 'contact' | 'document';
    id: string;
    name: string;
  };
}

export const useAIChat = () => {
  const [messages, setMessages] = useRecoilState(chatMessagesState);
  const [loading, setLoading] = useRecoilState(chatLoadingState);
  const [error, setError] = useRecoilState(chatErrorState);
  const [activeAgent, setActiveAgent] = useRecoilState(activeAgentState);
  const linkedEntity = useRecoilValue(linkedEntityState);
  const setLinkedEntity = useSetRecoilState(linkedEntityState);

  const sendMessage = useCallback(
    async (content: string, options?: SendMessageOptions) => {
      // Add user message
      const userMessage: ChatMessage = {
        id: uuidv4(),
        role: 'user',
        content,
        timestamp: new Date(),
        metadata: options?.linkedEntity
          ? { linkedEntity: options.linkedEntity }
          : undefined,
      };

      setMessages((prev) => [...prev, userMessage]);
      setLoading(true);
      setError(null);

      try {
        // Build context for the agent
        const context = {
          messages: [...messages, userMessage],
          activeAgent,
          linkedEntity: options?.linkedEntity || linkedEntity,
          agentConfig: AGENT_CONFIGS[activeAgent],
        };

        // Call backend API
        const response = await fetch('/api/ai-chat/message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content,
            context,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to send message');
        }

        const data = await response.json();

        // Add assistant message
        const assistantMessage: ChatMessage = {
          id: uuidv4(),
          role: 'assistant',
          content: data.content,
          agent: data.agent || activeAgent,
          timestamp: new Date(),
          metadata: {
            toolCalls: data.toolCalls,
          },
        };

        setMessages((prev) => [...prev, assistantMessage]);

        // Update active agent if switched
        if (data.agent && data.agent !== activeAgent) {
          setActiveAgent(data.agent);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);

        // Add error message to chat
        const errorChatMessage: ChatMessage = {
          id: uuidv4(),
          role: 'system',
          content: `Error: ${errorMessage}`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorChatMessage]);
      } finally {
        setLoading(false);
      }
    },
    [messages, activeAgent, linkedEntity, setMessages, setLoading, setError, setActiveAgent]
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
    setActiveAgent('orchestrator');
    setLinkedEntity(null);
  }, [setMessages, setError, setActiveAgent, setLinkedEntity]);

  const switchAgent = useCallback(
    (agent: AgentType) => {
      setActiveAgent(agent);

      // Add system message about agent switch
      const systemMessage: ChatMessage = {
        id: uuidv4(),
        role: 'system',
        content: `Switched to ${AGENT_CONFIGS[agent].name}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, systemMessage]);
    },
    [setActiveAgent, setMessages]
  );

  return {
    messages,
    loading,
    error,
    activeAgent,
    linkedEntity,
    sendMessage,
    clearChat,
    switchAgent,
    setLinkedEntity,
  };
};
```

**Step 2: Create agent router hook**

Create `packages/twenty-front/src/modules/ai-chat/hooks/useAgentRouter.ts`:

```typescript
import { useCallback } from 'react';
import { AgentType } from '../types/chat.types';
import { AGENT_ROUTE_KEYWORDS } from '../constants/agents';

export const useAgentRouter = () => {
  const detectAgent = useCallback((message: string): AgentType => {
    const lowerMessage = message.toLowerCase();

    // Check each agent's keywords
    for (const [agent, keywords] of Object.entries(AGENT_ROUTE_KEYWORDS)) {
      if (agent === 'orchestrator') continue;

      for (const keyword of keywords) {
        if (lowerMessage.includes(keyword)) {
          return agent as AgentType;
        }
      }
    }

    // Default to orchestrator if no match
    return 'orchestrator';
  }, []);

  const shouldSwitchAgent = useCallback(
    (message: string, currentAgent: AgentType): AgentType | null => {
      const detectedAgent = detectAgent(message);

      // Only suggest switch if different from current and not orchestrator
      if (detectedAgent !== currentAgent && detectedAgent !== 'orchestrator') {
        return detectedAgent;
      }

      return null;
    },
    [detectAgent]
  );

  return {
    detectAgent,
    shouldSwitchAgent,
  };
};
```

**Step 3: Export hooks**

Update `packages/twenty-front/src/modules/ai-chat/index.ts`:

```typescript
// AI Chat Module - Twenty CRM
// Provides AI-powered chat interface with specialized agents

export * from './components/AIChatWidget';
export * from './hooks/useAIChat';
export * from './hooks/useAgentRouter';
export * from './types/chat.types';
export * from './states/chatState';
export * from './constants/agents';
```

**Step 4: Commit hooks**

Run:
```bash
git add packages/twenty-front/src/modules/ai-chat/hooks/
git add packages/twenty-front/src/modules/ai-chat/index.ts
git commit -m "feat(ai-chat): add useAIChat and useAgentRouter hooks

- useAIChat: manages chat state, sends messages, handles errors
- useAgentRouter: detects agent from message keywords
- Integrates with Recoil state management

SMA-62: AI Chat Widget (React)"
```

---

### Task 5: Create Chat Widget Components

**Files:**
- Create: `packages/twenty-front/src/modules/ai-chat/components/AIChatWidget.tsx`
- Create: `packages/twenty-front/src/modules/ai-chat/components/ChatMessage.tsx`
- Create: `packages/twenty-front/src/modules/ai-chat/components/ChatInput.tsx`
- Create: `packages/twenty-front/src/modules/ai-chat/components/AgentIndicator.tsx`

**Step 1: Create ChatMessage component**

Create `packages/twenty-front/src/modules/ai-chat/components/ChatMessage.tsx`:

```typescript
import styled from '@emotion/styled';
import { ChatMessage as ChatMessageType } from '../types/chat.types';
import { AGENT_CONFIGS } from '../constants/agents';

const MessageContainer = styled.div<{ isUser: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${({ isUser }) => (isUser ? 'flex-end' : 'flex-start')};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const MessageBubble = styled.div<{ isUser: boolean; isSystem: boolean }>`
  max-width: 80%;
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(3)};
  border-radius: ${({ theme }) => theme.border.radius.md};
  background-color: ${({ isUser, isSystem, theme }) =>
    isSystem
      ? theme.background.transparent.light
      : isUser
        ? theme.color.blue
        : theme.background.secondary};
  color: ${({ isUser, isSystem, theme }) =>
    isSystem
      ? theme.font.color.tertiary
      : isUser
        ? theme.color.white
        : theme.font.color.primary};
  font-size: ${({ isSystem }) => (isSystem ? '0.85rem' : '1rem')};
  font-style: ${({ isSystem }) => (isSystem ? 'italic' : 'normal')};
`;

const AgentLabel = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.font.color.tertiary};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const Timestamp = styled.span`
  font-size: 0.7rem;
  color: ${({ theme }) => theme.font.color.light};
  margin-top: ${({ theme }) => theme.spacing(1)};
`;

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  const agentConfig = message.agent ? AGENT_CONFIGS[message.agent] : null;

  return (
    <MessageContainer isUser={isUser}>
      {agentConfig && !isUser && (
        <AgentLabel>{agentConfig.name}</AgentLabel>
      )}
      <MessageBubble isUser={isUser} isSystem={isSystem}>
        {message.content}
      </MessageBubble>
      <Timestamp>
        {message.timestamp.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </Timestamp>
    </MessageContainer>
  );
};
```

**Step 2: Create ChatInput component**

Create `packages/twenty-front/src/modules/ai-chat/components/ChatInput.tsx`:

```typescript
import { useState, useCallback, KeyboardEvent } from 'react';
import styled from '@emotion/styled';
import { IconSend, IconPaperclip } from '@tabler/icons-react';

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};
  border-top: 1px solid ${({ theme }) => theme.border.color.light};
  background-color: ${({ theme }) => theme.background.primary};
`;

const TextInput = styled.input`
  flex: 1;
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(3)};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  font-size: 1rem;
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.color.blue};
  }

  &:disabled {
    background-color: ${({ theme }) => theme.background.secondary};
    cursor: not-allowed;
  }
`;

const IconButton = styled.button<{ disabled?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  background-color: ${({ disabled, theme }) =>
    disabled ? theme.background.secondary : theme.color.blue};
  color: ${({ disabled, theme }) =>
    disabled ? theme.font.color.light : theme.color.white};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  transition: background-color 0.2s;

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.color.blue50};
  }
`;

interface ChatInputProps {
  onSend: (message: string) => void;
  onAttach?: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput = ({
  onSend,
  onAttach,
  disabled = false,
  placeholder = 'Type a message...',
}: ChatInputProps) => {
  const [value, setValue] = useState('');

  const handleSend = useCallback(() => {
    if (value.trim() && !disabled) {
      onSend(value.trim());
      setValue('');
    }
  }, [value, disabled, onSend]);

  const handleKeyPress = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  return (
    <InputContainer>
      {onAttach && (
        <IconButton onClick={onAttach} disabled={disabled}>
          <IconPaperclip size={20} />
        </IconButton>
      )}
      <TextInput
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        disabled={disabled}
      />
      <IconButton onClick={handleSend} disabled={disabled || !value.trim()}>
        <IconSend size={20} />
      </IconButton>
    </InputContainer>
  );
};
```

**Step 3: Create AgentIndicator component**

Create `packages/twenty-front/src/modules/ai-chat/components/AgentIndicator.tsx`:

```typescript
import styled from '@emotion/styled';
import {
  IconRobot,
  IconGitBranch,
  IconDatabase,
  IconUser,
  IconMail,
} from '@tabler/icons-react';
import { AgentType } from '../types/chat.types';
import { AGENT_CONFIGS } from '../constants/agents';

const IndicatorContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(3)};
  background-color: ${({ theme }) => theme.background.secondary};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
`;

const AgentIcon = styled.div<{ color: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${({ color }) => color};
  color: white;
`;

const AgentInfo = styled.div`
  flex: 1;
`;

const AgentName = styled.div`
  font-weight: ${({ theme }) => theme.font.weight.medium};
  font-size: 0.9rem;
`;

const AgentDescription = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const AGENT_ICONS: Record<AgentType, React.ComponentType<{ size: number }>> = {
  orchestrator: IconRobot,
  workflow: IconGitBranch,
  data: IconDatabase,
  context: IconUser,
  content: IconMail,
};

const AGENT_COLORS: Record<AgentType, string> = {
  orchestrator: '#6366f1',
  workflow: '#8b5cf6',
  data: '#0ea5e9',
  context: '#10b981',
  content: '#f59e0b',
};

interface AgentIndicatorProps {
  agent: AgentType;
  loading?: boolean;
}

export const AgentIndicator = ({
  agent,
  loading = false,
}: AgentIndicatorProps) => {
  const config = AGENT_CONFIGS[agent];
  const Icon = AGENT_ICONS[agent];

  return (
    <IndicatorContainer>
      <AgentIcon color={AGENT_COLORS[agent]}>
        <Icon size={18} />
      </AgentIcon>
      <AgentInfo>
        <AgentName>
          {config.name}
          {loading && ' (typing...)'}
        </AgentName>
        <AgentDescription>{config.description}</AgentDescription>
      </AgentInfo>
    </IndicatorContainer>
  );
};
```

**Step 4: Create main AIChatWidget component**

Create `packages/twenty-front/src/modules/ai-chat/components/AIChatWidget.tsx`:

```typescript
import { useRef, useEffect } from 'react';
import styled from '@emotion/styled';
import { IconX, IconRobot } from '@tabler/icons-react';
import { useRecoilState } from 'recoil';

import { chatWidgetOpenState } from '../states/chatState';
import { useAIChat } from '../hooks/useAIChat';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { AgentIndicator } from './AgentIndicator';

const WidgetContainer = styled.div<{ isOpen: boolean }>`
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: ${({ isOpen }) => (isOpen ? '400px' : 'auto')};
  height: ${({ isOpen }) => (isOpen ? '600px' : 'auto')};
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.background.primary};
  border-radius: ${({ theme }) => theme.border.radius.md};
  box-shadow: ${({ theme }) => theme.boxShadow.strong};
  overflow: hidden;
  z-index: 1000;
  transition: all 0.3s ease;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(3)};
  background-color: ${({ theme }) => theme.color.blue};
  color: white;
`;

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;

  &:hover {
    background-color: rgba(255, 255, 255, 0.3);
  }
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing(3)};
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${({ theme }) => theme.font.color.tertiary};
  text-align: center;
  padding: ${({ theme }) => theme.spacing(4)};
`;

const FloatingButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border: none;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.color.blue};
  color: white;
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.boxShadow.strong};

  &:hover {
    background-color: ${({ theme }) => theme.color.blue50};
  }
`;

export const AIChatWidget = () => {
  const [isOpen, setIsOpen] = useRecoilState(chatWidgetOpenState);
  const { messages, loading, activeAgent, sendMessage, clearChat } =
    useAIChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) {
    return (
      <WidgetContainer isOpen={false}>
        <FloatingButton onClick={() => setIsOpen(true)}>
          <IconRobot size={28} />
        </FloatingButton>
      </WidgetContainer>
    );
  }

  return (
    <WidgetContainer isOpen={true}>
      <Header>
        <HeaderTitle>
          <IconRobot size={24} />
          AI Assistant
        </HeaderTitle>
        <CloseButton onClick={() => setIsOpen(false)}>
          <IconX size={20} />
        </CloseButton>
      </Header>

      <AgentIndicator agent={activeAgent} loading={loading} />

      <MessagesContainer>
        {messages.length === 0 ? (
          <EmptyState>
            <IconRobot size={48} />
            <p>How can I help you today?</p>
            <p style={{ fontSize: '0.85rem' }}>
              Try asking about workflows, data, or company context
            </p>
          </EmptyState>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </MessagesContainer>

      <ChatInput onSend={sendMessage} disabled={loading} />
    </WidgetContainer>
  );
};
```

**Step 5: Commit components**

Run:
```bash
git add packages/twenty-front/src/modules/ai-chat/components/
git commit -m "feat(ai-chat): add chat widget React components

- AIChatWidget: main floating widget container
- ChatMessage: message bubble with agent labels
- ChatInput: input field with send button
- AgentIndicator: shows active agent with icon

SMA-62: AI Chat Widget (React)"
```

---

## Phase 3: Backend API Integration (SMA-51)

### Task 6: Create AI Chat Backend Module

**Files:**
- Create: `packages/twenty-server/src/engine/api/rest/ai-chat/` directory
- Create: API controller and service

**Step 1: Create backend module structure**

Run:
```bash
mkdir -p packages/twenty-server/src/engine/api/rest/ai-chat
```

**Step 2: Create AI Chat DTOs**

Create `packages/twenty-server/src/engine/api/rest/ai-chat/dtos/send-message.dto.ts`:

```typescript
import { IsString, IsOptional, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class LinkedEntityDto {
  @IsString()
  type: 'company' | 'contact' | 'document';

  @IsString()
  id: string;

  @IsString()
  name: string;
}

export class SendMessageDto {
  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => LinkedEntityDto)
  linkedEntity?: LinkedEntityDto;
}
```

**Step 3: Create AI Chat Service**

Create `packages/twenty-server/src/engine/api/rest/ai-chat/ai-chat.service.ts`:

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatResponse {
  content: string;
  agent?: string;
  toolCalls?: Array<{
    id: string;
    name: string;
    arguments: Record<string, unknown>;
    result?: unknown;
  }>;
}

@Injectable()
export class AIChatService {
  private readonly logger = new Logger(AIChatService.name);
  private readonly ctxMcpUrl: string;
  private readonly kbMcpUrl: string;
  private readonly n8nApiUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.ctxMcpUrl = this.configService.get('CTX_MCP_URL', 'http://ctx-mcp:3100');
    this.kbMcpUrl = this.configService.get('KB_MCP_URL', 'http://kb-mcp:3110');
    this.n8nApiUrl = this.configService.get('N8N_API_URL', 'http://n8n:5678');
  }

  async sendMessage(
    content: string,
    context: {
      messages: ChatMessage[];
      activeAgent: string;
      linkedEntity?: { type: string; id: string; name: string };
      workspaceId: string;
      userId: string;
    },
  ): Promise<ChatResponse> {
    this.logger.log(`Processing message for agent: ${context.activeAgent}`);

    try {
      // Route to appropriate agent handler
      switch (context.activeAgent) {
        case 'workflow':
          return this.handleWorkflowAgent(content, context);
        case 'data':
          return this.handleDataAgent(content, context);
        case 'context':
          return this.handleContextAgent(content, context);
        case 'content':
          return this.handleContentAgent(content, context);
        default:
          return this.handleOrchestrator(content, context);
      }
    } catch (error) {
      this.logger.error(`Error processing message: ${error.message}`);
      throw error;
    }
  }

  private async handleOrchestrator(
    content: string,
    context: any,
  ): Promise<ChatResponse> {
    // Simple keyword-based routing
    const lowerContent = content.toLowerCase();

    if (
      lowerContent.includes('workflow') ||
      lowerContent.includes('automate') ||
      lowerContent.includes('n8n')
    ) {
      return {
        content:
          'I can help you create workflows. What kind of automation do you need?',
        agent: 'workflow',
      };
    }

    if (
      lowerContent.includes('create') ||
      lowerContent.includes('update') ||
      lowerContent.includes('contact') ||
      lowerContent.includes('company')
    ) {
      return {
        content: 'I can help you manage CRM data. What would you like to do?',
        agent: 'data',
      };
    }

    if (
      lowerContent.includes('who') ||
      lowerContent.includes('what') ||
      lowerContent.includes('about')
    ) {
      return {
        content:
          'I can provide context about people and companies. What would you like to know?',
        agent: 'context',
      };
    }

    if (
      lowerContent.includes('write') ||
      lowerContent.includes('email') ||
      lowerContent.includes('draft')
    ) {
      return {
        content:
          'I can help you write content. What would you like me to compose?',
        agent: 'content',
      };
    }

    return {
      content: `I'm your AI assistant. I can help you with:
- **Workflows**: Create and manage n8n automations
- **Data**: Create, update, search CRM records
- **Context**: Get information about people and companies
- **Content**: Write emails and newsletters

What would you like to do?`,
      agent: 'orchestrator',
    };
  }

  private async handleWorkflowAgent(
    content: string,
    context: any,
  ): Promise<ChatResponse> {
    // TODO: Implement n8n-mcp integration
    return {
      content: `I understand you want to work with workflows.
Let me help you create an automation.

What should trigger this workflow?`,
      agent: 'workflow',
    };
  }

  private async handleDataAgent(
    content: string,
    context: any,
  ): Promise<ChatResponse> {
    // TODO: Implement Twenty GraphQL integration
    return {
      content: `I can help you manage CRM data.
What record would you like to create or update?`,
      agent: 'data',
    };
  }

  private async handleContextAgent(
    content: string,
    context: any,
  ): Promise<ChatResponse> {
    // Call ctx-mcp for context
    try {
      const response = await fetch(`${this.ctxMcpUrl}/mcp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'tools/call',
          params: {
            name: 'ctx_get_context',
            arguments: {
              workspace_id: context.workspaceId,
              profile_id: context.userId,
            },
          },
          id: Date.now(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          content: `Based on the context I found:\n${JSON.stringify(data.result, null, 2)}`,
          agent: 'context',
          toolCalls: [
            {
              id: 'ctx_1',
              name: 'ctx_get_context',
              arguments: { workspace_id: context.workspaceId },
              result: data.result,
            },
          ],
        };
      }
    } catch (error) {
      this.logger.warn(`Failed to fetch context: ${error.message}`);
    }

    return {
      content: 'I can provide information about your workspace context. What would you like to know?',
      agent: 'context',
    };
  }

  private async handleContentAgent(
    content: string,
    context: any,
  ): Promise<ChatResponse> {
    // TODO: Implement content generation with LLM
    return {
      content: `I can help you write content.
What type of content do you need?
- Email to a contact
- Newsletter for subscribers
- Follow-up message`,
      agent: 'content',
    };
  }
}
```

**Step 4: Create AI Chat Controller**

Create `packages/twenty-server/src/engine/api/rest/ai-chat/ai-chat.controller.ts`:

```typescript
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Logger,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/engine/guards/jwt.auth.guard';
import { AIChatService } from './ai-chat.service';
import { SendMessageDto } from './dtos/send-message.dto';

@Controller('ai-chat')
@UseGuards(JwtAuthGuard)
export class AIChatController {
  private readonly logger = new Logger(AIChatController.name);

  constructor(private readonly aiChatService: AIChatService) {}

  @Post('message')
  async sendMessage(@Body() dto: SendMessageDto, @Req() req: any) {
    this.logger.log(`Received message from user: ${req.user?.id}`);

    const context = {
      messages: [],
      activeAgent: 'orchestrator',
      linkedEntity: dto.linkedEntity,
      workspaceId: req.user?.workspaceId || 'default',
      userId: req.user?.id || 'anonymous',
    };

    return this.aiChatService.sendMessage(dto.content, context);
  }
}
```

**Step 5: Create AI Chat Module**

Create `packages/twenty-server/src/engine/api/rest/ai-chat/ai-chat.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { AIChatController } from './ai-chat.controller';
import { AIChatService } from './ai-chat.service';

@Module({
  controllers: [AIChatController],
  providers: [AIChatService],
  exports: [AIChatService],
})
export class AIChatModule {}
```

**Step 6: Commit backend module**

Run:
```bash
git add packages/twenty-server/src/engine/api/rest/ai-chat/
git commit -m "feat(ai-chat): add backend API module

- AIChatController: handles /api/ai-chat/message endpoint
- AIChatService: routes messages to agent handlers
- Integrates with ctx-mcp for context retrieval
- Placeholder for n8n-mcp and GraphQL integration

SMA-57: Orchestrator Agent"
```

---

## Summary

This plan covers the core integration between Twenty CRM and the Smartout AI Layer:

### Phase 1: Infrastructure (Tasks 1-2)
- Connect to `smartout-ai-network`
- Add environment variables for MCP endpoints

### Phase 2: Frontend (Tasks 3-5)
- Module structure with types, states, constants
- React hooks for chat state and agent routing
- Widget components (chat, input, agent indicator)

### Phase 3: Backend (Task 6)
- NestJS API module for chat endpoints
- Agent routing service with MCP integration

### Next Steps (Future Tasks)
- [ ] Task 7: Implement Workflow Agent with n8n-mcp
- [ ] Task 8: Implement Data Agent with GraphQL
- [ ] Task 9: Implement Content Agent with LLM
- [ ] Task 10: Add file upload support
- [ ] Task 11: Add entity linking (@mentions)
- [ ] Task 12: Bubble.io data import (SMA-102)

---

**Plan complete and saved to `docs/plans/2026-01-13-twenty-ai-layer-integration.md`.**

**Execution options:**

1. **Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

2. **Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**
