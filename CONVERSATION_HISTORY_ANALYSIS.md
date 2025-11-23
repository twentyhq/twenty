# Agent Chat Conversation History Analysis

## Problem
Users report that the AI agent sometimes doesn't seem to remember previous messages in the conversation.

## Message Flow Architecture

### 1. **Message Storage** ✅ Working Correctly
- Messages are stored in PostgreSQL via `AgentChatMessageEntity` and `AgentChatMessagePartEntity`
- Thread-based organization via `AgentChatThreadEntity`
- Messages are retrieved with proper ordering: `order: { createdAt: 'ASC' }`

**Files:**
- `packages/twenty-server/src/engine/metadata-modules/agent/agent-chat.service.ts`
- Lines 105-125: `getMessagesForThread()` method

### 2. **Frontend Message Loading** ✅ Working Correctly
- Frontend loads messages from DB via GraphQL query `useGetChatMessagesQuery`
- Messages are mapped from DB format to UI format via `mapDBMessagesToUIMessages()`
- All historical messages are loaded when a thread is opened

**Files:**
- `packages/twenty-front/src/modules/ai/hooks/useAgentChatData.ts`
- Lines 27-33: GraphQL query execution
- `packages/twenty-front/src/modules/ai/utils/mapDBMessagesToUIMessages.ts`

### 3. **Backend Message Handling** ⚠️ **CRITICAL ISSUE**

The backend **DOES NOT** load message history from the database. It completely relies on the frontend sending ALL messages in each request.

**Evidence:**
```typescript
// agent-chat.controller.ts (lines 37-57)
@Post('stream')
async streamAgentChat(
  @Body()
  body: {
    threadId: string;
    messages: UIMessage<unknown, UIDataTypes, UITools>[]; // ← Frontend must send ALL messages
    recordIdsByObjectMetadataNameSingular?: RecordIdsByObjectMetadataNameSingularType;
  },
  // ...
) {
  this.agentStreamingService.streamAgentChat({
    threadId: body.threadId,
    messages: body.messages, // ← Uses only what frontend sends
    // ...
  });
}
```

The backend:
- ✅ Validates the thread exists (line 69-82 in agent-streaming.service.ts)
- ❌ **Never loads historical messages from the database**
- ❌ Only uses `messages` array from request body

### 4. **Frontend Message Sending** 🐛 **BUG IDENTIFIED**

The Vercel AI SDK's `useChat` hook is initialized with a **changing `id`**:

```typescript
// useAgentChat.ts (lines 93-113)
const { sendMessage, messages, status, error, regenerate } = useChat({
  transport: new DefaultChatTransport({
    api: `${REST_API_BASE_URL}/agent-chat/stream`,
    // ...
  }),
  messages: uiMessages,
  id: `${currentAIChatThread}-${uiMessages.length}`, // ← BUG: Changes every message!
});
```

**Problem:** The `id` changes every time a new message is added (`uiMessages.length` increments). When the `id` changes, the `useChat` hook may reinitialize its internal state, potentially losing the message history context.

## Root Causes

### Primary Issue: Dynamic ID in useChat Hook
The `id` prop in `useChat` should be stable across the lifetime of a conversation thread. Changing it causes the hook to treat each new message as a new conversation context.

**Current:**
```typescript
id: `${currentAIChatThread}-${uiMessages.length}` // Changes: thread-1, thread-2, thread-3...
```

**Should be:**
```typescript
id: currentAIChatThread // Stable: same ID for entire thread
```

### Secondary Issue: Backend Not Loading History (By Design)
The backend relies entirely on the frontend to send the full message history. This is actually a common pattern for chat APIs (similar to OpenAI's API), but it means:
- ✅ Less database queries (better performance)
- ❌ Frontend must correctly manage and send full history
- ❌ If frontend fails to send history, backend has no fallback

## Evidence of Message Flow

### Router receives messages:
```typescript
// ai-router.service.ts (lines 92-106)
const conversationHistory = messages
  .slice(0, -1) // All messages except the last
  .map((msg) => {
    const textContent = msg.parts.find((part) => part.type === 'text')?.text || '';
    return `${msg.role}: ${textContent}`;
  })
  .join('\n');

const currentMessage = messages[messages.length - 1]?.parts.find(
  (part) => part.type === 'text',
)?.text || '';
```

The router explicitly uses `messages.slice(0, -1)` as conversation history, proving it expects multiple messages.

### Agent execution receives messages:
```typescript
// agent-execution.service.ts (lines 330-337)
const aiRequestConfig = await this.prepareAIRequestConfig({
  system: `${AGENT_SYSTEM_PROMPTS.BASE}\n${AGENT_SYSTEM_PROMPTS.CHAT_ADDITIONS}\n\n${agent.prompt}${contextString}`,
  agent,
  messages, // ← Passed to AI model
  actorContext,
  roleIds: [roleId, ...(agent?.roleId ? [agent?.roleId] : [])],
  toolHints,
});
```

The `messages` array is passed directly to the AI model via `convertToModelMessages(messages)` (line 129 in prepareAIRequestConfig).

## Recommended Fixes

### **Fix 1: Stable useChat ID** (High Priority)
```typescript
// packages/twenty-front/src/modules/ai/hooks/useAgentChat.ts

const { sendMessage, messages, status, error, regenerate } = useChat({
  transport: new DefaultChatTransport({
    api: `${REST_API_BASE_URL}/agent-chat/stream`,
    headers: () => ({
      Authorization: `Bearer ${getTokenPair()?.accessOrWorkspaceAgnosticToken.token}`,
    }),
    fetch: async (input, init) => {
      const response = await fetch(input, init);
      if (response.status !== 401) {
        return response;
      }
      const retriedResponse = await retryFetchWithRenewedToken(input, init);
      return retriedResponse ?? response;
    },
  }),
  messages: uiMessages,
  id: currentAIChatThread, // ✅ Remove .length suffix
});
```

### **Fix 2: Backend Fallback Loading** (Optional, for robustness)
Add a fallback in the backend to load history if only 1 message is received:

```typescript
// packages/twenty-server/src/engine/metadata-modules/agent/agent-streaming.service.ts

async streamAgentChat({
  threadId,
  userWorkspaceId,
  workspace,
  messages,
  recordIdsByObjectMetadataNameSingular,
  response,
}: StreamAgentChatOptions) {
  try {
    const thread = await this.threadRepository.findOne({
      where: { id: threadId, userWorkspaceId },
      relations: ['messages'],
    });

    if (!thread) {
      throw new AgentException(
        'Thread not found',
        AgentExceptionCode.AGENT_EXECUTION_FAILED,
      );
    }

    // NEW: If only 1 message received, load history from DB
    let messagesWithHistory = messages;
    if (messages.length === 1 && thread.messages.length > 0) {
      const dbMessages = await this.agentChatService.getMessagesForThread(
        threadId,
        userWorkspaceId,
      );
      const historicalMessages = mapDBMessagesToUIMessages(dbMessages);
      messagesWithHistory = [...historicalMessages, ...messages];
      this.logger.log(
        `Loaded ${historicalMessages.length} historical messages from DB`,
      );
    }

    // Continue with messagesWithHistory instead of messages
    const routeResult = await this.aiRouterService.routeMessage({
      messages: messagesWithHistory, // ✅ Use history
      workspaceId: workspace.id,
      routerModel: workspace.routerModel,
      plannerModel: workspace.plannerModel,
    }, includeDebugInfo);
    // ...
  }
}
```

### **Fix 3: Add Logging** (Debugging)
Add logging to see how many messages are received:

```typescript
// agent-chat.controller.ts
@Post('stream')
async streamAgentChat(@Body() body, ...) {
  this.logger.log(
    `Received ${body.messages.length} messages for thread ${body.threadId}`,
  );
  this.agentStreamingService.streamAgentChat({...});
}
```

## Testing Recommendations

1. **Test message history:**
   - Start a new thread
   - Send message: "My name is Alice"
   - Send message: "What is my name?"
   - AI should respond with "Alice"

2. **Test across sessions:**
   - Close and reopen the chat
   - Continue conversation
   - Verify AI remembers context

3. **Monitor logs:**
   - Check how many messages are sent in each request
   - Verify `useChat` hook maintains full history

## Files to Change

1. **High Priority:**
   - `packages/twenty-front/src/modules/ai/hooks/useAgentChat.ts` (line 112)

2. **Medium Priority (Robustness):**
   - `packages/twenty-server/src/engine/metadata-modules/agent/agent-streaming.service.ts` (around line 67)
   - Add `mapDBMessagesToUIMessages` import and fallback logic

3. **Optional (Debugging):**
   - `packages/twenty-server/src/engine/metadata-modules/agent/agent-chat.controller.ts` (line 48)
   - Add logging

## Conclusion

The conversation history system is **architecturally sound** but has a **critical bug** in the frontend `useChat` hook configuration. The changing `id` prop likely causes the hook to lose message context. Fixing this single line should resolve the reported issue.

The backend's reliance on the frontend for message history is by design (performance optimization), but adding a fallback would make the system more robust against frontend bugs.

