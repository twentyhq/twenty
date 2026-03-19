import { useState, useEffect, useCallback, useRef } from 'react';

// ── Types ────────────────────────────────────────────────────────

export interface AgentMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface PersistedSession {
  conversationId: string;
  sessionId: string;
  messages: AgentMessage[];
  createdAt: number;
  expiresAt: number;
}

interface UseSalesAngelParams {
  conversationId: string | null;
  phoneNumber: string | null;
  onCopyToChat?: (message: string) => void;
}

interface UseSalesAngelReturn {
  messages: AgentMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearConversation: () => void;
  copyToChat: (messageContent: string) => void;
  sessionId: string | null;
}

// ── Constants ────────────────────────────────────────────────────

const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const STORAGE_KEY_PREFIX = 'sales-angel-session-';
const ANGEL_API_URL = 'https://angel.tob.sh/api/sales-angel';
const ANGEL_API_TOKEN =
  '6895354ae7d9d71bde480ba2b4dad9e8193d6fbea2c9891433fb62e2ab00159c';

// ── Storage Utilities ────────────────────────────────────────────

const getStorageKey = (conversationId: string): string =>
  `${STORAGE_KEY_PREFIX}${conversationId}`;

const saveSession = (
  conversationId: string,
  sessionId: string,
  messages: AgentMessage[],
): void => {
  try {
    const now = Date.now();
    const session: PersistedSession = {
      conversationId,
      sessionId,
      messages: messages.map((m) => ({
        ...m,
        timestamp:
          m.timestamp instanceof Date ? m.timestamp : new Date(m.timestamp),
      })),
      createdAt: now,
      expiresAt: now + SESSION_TTL_MS,
    };
    localStorage.setItem(
      getStorageKey(conversationId),
      JSON.stringify(session),
    );
  } catch (error) {
    console.warn('Failed to save Sales Angel session:', error);
  }
};

const loadSession = (conversationId: string): PersistedSession | null => {
  try {
    const stored = localStorage.getItem(getStorageKey(conversationId));
    if (!stored) return null;

    const session: PersistedSession = JSON.parse(stored);

    if (Date.now() > session.expiresAt) {
      localStorage.removeItem(getStorageKey(conversationId));
      return null;
    }

    session.messages = session.messages.map((m) => ({
      ...m,
      timestamp: new Date(m.timestamp),
    }));

    return session;
  } catch (error) {
    console.warn('Failed to load Sales Angel session:', error);
    return null;
  }
};

const clearStoredSession = (conversationId: string): void => {
  try {
    localStorage.removeItem(getStorageKey(conversationId));
  } catch (error) {
    console.warn('Failed to clear Sales Angel session:', error);
  }
};

// ── Helpers ──────────────────────────────────────────────────────

const generateId = (): string =>
  `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

/**
 * Extract blockquote content from markdown — used for "Use in Chat".
 * Returns the first blockquote block or null.
 */
export const extractSuggestion = (markdown: string): string | null => {
  const lines = markdown.split('\n');
  const blockquoteLines: string[] = [];
  let inBlockquote = false;

  for (const line of lines) {
    if (line.trim().startsWith('>')) {
      inBlockquote = true;
      blockquoteLines.push(line.trim().replace(/^>\s*/, ''));
    } else if (inBlockquote && line.trim() === '') {
      continue;
    } else {
      inBlockquote = false;
    }
  }

  return blockquoteLines.length > 0
    ? blockquoteLines.join('\n').trim()
    : null;
};

/**
 * Derive waha_chat_id from a phone number.
 * Input: "491782742408" or "+491782742408"
 * Output: "491782742408@c.us"
 */
const toWahaChatId = (phone: string): string => {
  const digits = phone.replace(/[^0-9]/g, '');
  return `${digits}@c.us`;
};

/**
 * Ensure phone has + prefix.
 */
const toE164 = (phone: string): string => {
  const digits = phone.replace(/[^0-9]/g, '');
  return `+${digits}`;
};

// ── Hook ─────────────────────────────────────────────────────────

export function useSalesAngel({
  conversationId,
  phoneNumber,
  onCopyToChat,
}: UseSalesAngelParams): UseSalesAngelReturn {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentConversationIdRef = useRef<string | null>(null);

  // ── Load persisted session on conversation switch ──────────────
  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setSessionId(null);
      setError(null);
      currentConversationIdRef.current = null;
      return;
    }

    if (currentConversationIdRef.current === conversationId) {
      return;
    }

    currentConversationIdRef.current = conversationId;

    const session = loadSession(conversationId);
    if (session) {
      setMessages(session.messages);
      setSessionId(session.sessionId);
      setError(null);
    } else {
      setMessages([]);
      setSessionId(null);
      setError(null);
    }
  }, [conversationId]);

  // ── Persist session on change ──────────────────────────────────
  useEffect(() => {
    if (conversationId && sessionId && messages.length > 0) {
      saveSession(conversationId, sessionId, messages);
    }
  }, [conversationId, sessionId, messages]);

  // ── Send message ───────────────────────────────────────────────
  const sendMessage = useCallback(
    async (content: string): Promise<void> => {
      if (!conversationId || !phoneNumber || !content.trim()) return;

      setIsLoading(true);
      setError(null);

      const userMessage: AgentMessage = {
        id: generateId(),
        role: 'user',
        content: content.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);

      try {
        const resp = await fetch(ANGEL_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${ANGEL_API_TOKEN}`,
          },
          body: JSON.stringify({
            phone: toE164(phoneNumber),
            waha_chat_id: toWahaChatId(phoneNumber),
            user_input: content.trim(),
            session_id: sessionId,
          }),
        });

        if (!resp.ok) {
          const text = await resp.text().catch(() => '');
          throw new Error(
            `Sales Angel API error (${resp.status}): ${text || resp.statusText}`,
          );
        }

        const data = (await resp.json()) as {
          reply: string;
          session_id: string;
        };

        const assistantMessage: AgentMessage = {
          id: generateId(),
          role: 'assistant',
          content: data.reply,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);

        if (data.session_id) {
          setSessionId(data.session_id);
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to get response from Sales Angel';
        setError(errorMessage);
        // Remove the user message on failure
        setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
      } finally {
        setIsLoading(false);
      }
    },
    [conversationId, phoneNumber, sessionId],
  );

  // ── Clear conversation ─────────────────────────────────────────
  const clearConversation = useCallback((): void => {
    if (conversationId) {
      clearStoredSession(conversationId);
    }
    setMessages([]);
    setSessionId(null);
    setError(null);
  }, [conversationId]);

  // ── Copy to chat ───────────────────────────────────────────────
  const copyToChat = useCallback(
    (messageContent: string): void => {
      const suggestion = extractSuggestion(messageContent);
      const textToCopy = suggestion || messageContent;
      onCopyToChat?.(textToCopy);
    },
    [onCopyToChat],
  );

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearConversation,
    copyToChat,
    sessionId,
  };
}
