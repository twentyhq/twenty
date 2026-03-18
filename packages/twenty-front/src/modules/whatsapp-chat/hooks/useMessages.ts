import { useCallback, useEffect, useRef, useState } from 'react';

import { useWhatsAppBridge } from '@/whatsapp-chat/hooks/useWhatsAppBridge';
import {
  type MessagesResponse,
  type WaMessage,
} from '@/whatsapp-chat/types/WhatsAppTypes';

interface UseMessagesOptions {
  conversationId: string | null;
  limit?: number;
}

export const useMessages = ({
  conversationId,
  limit = 50,
}: UseMessagesOptions) => {
  const { bridgeFetch } = useWhatsAppBridge();

  const [messages, setMessages] = useState<WaMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState<string | undefined>(undefined);

  const abortRef = useRef<AbortController | null>(null);

  const fetchMessages = useCallback(
    async (loadOlder = false) => {
      if (!conversationId) return;

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);

      try {
        const params = new URLSearchParams();
        params.set('limit', String(limit));

        if (loadOlder && cursor) {
          params.set('cursor', cursor);
        }

        const path = `/api/v1/conversations/${conversationId}/messages?${params.toString()}`;

        const data = await bridgeFetch<MessagesResponse>(path, {
          signal: controller.signal,
        });

        const items = data?.items ?? [];

        setMessages((prev) => {
          const merged = loadOlder ? [...items, ...prev] : items;
          return merged.sort(
            (a, b) =>
              new Date(a.messageTimestamp).getTime() -
              new Date(b.messageTimestamp).getTime(),
          );
        });
        setCursor(data?.cursor ?? undefined);
        setHasMore(data?.hasMore ?? false);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }
      } finally {
        setLoading(false);
      }
    },
    [bridgeFetch, conversationId, limit, cursor],
  );

  useEffect(() => {
    if (conversationId) {
      setMessages([]);
      setCursor(undefined);
      setHasMore(false);
      fetchMessages(false);
    } else {
      setMessages([]);
    }

    return () => {
      abortRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  const loadOlder = useCallback(() => {
    if (hasMore && !loading) {
      fetchMessages(true);
    }
  }, [hasMore, loading, fetchMessages]);

  const refresh = useCallback(() => {
    fetchMessages(false);
  }, [fetchMessages]);

  const addOptimisticMessage = useCallback((message: WaMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const updateMessageByTempId = useCallback(
    (tempId: string, updates: Partial<WaMessage>) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.tempId === tempId ? { ...msg, ...updates } : msg,
        ),
      );
    },
    [],
  );

  const updateMessageById = useCallback(
    (id: string, updates: Partial<WaMessage>) => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === id ? { ...msg, ...updates } : msg)),
      );
    },
    [],
  );

  const updateMessageByWahaId = useCallback(
    (wahaId: string, updates: Partial<WaMessage>) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.wahaId === wahaId ? { ...msg, ...updates } : msg,
        ),
      );
    },
    [],
  );

  const addMessage = useCallback((message: WaMessage) => {
    setMessages((prev) => {
      const matches = (m: WaMessage) =>
        (message.id && m.id === message.id) ||
        (message.tempId && m.tempId === message.tempId) ||
        (message.wahaId && m.wahaId === message.wahaId);

      const exists = prev.some(matches);

      if (exists) {
        return prev.map((m) => (matches(m) ? { ...m, ...message } : m));
      }

      // Dedup outgoing agent messages: if a recent optimistic message
      // matches by content, merge instead of adding a duplicate.
      // For media messages (voice/image), WAHA returns body=null so we
      // also match by mimetype when both messages have media.
      if (message.fromAgent) {
        const msgTime = new Date(message.messageTimestamp).getTime();
        const optimisticMatch = prev.find((m) => {
          if (!m.fromAgent || !m.tempId) return false;
          const timeDiff = Math.abs(
            new Date(m.messageTimestamp).getTime() - msgTime,
          );
          if (timeDiff >= 60_000) return false;

          // Text match
          if (m.body && message.body && m.body === message.body) return true;

          // Media match: both have media with compatible mimetype
          if (m.hasMedia && message.hasMedia) {
            const mBase = (m.mediaMimetype ?? '').split(';')[0];
            const msgBase = (message.mediaMimetype ?? '').split(';')[0];
            if (mBase && msgBase && mBase === msgBase) return true;
            // If incoming has no mimetype but is media, still match
            // the only recent optimistic media message
            if (m.hasMedia) return true;
          }

          return false;
        });

        if (optimisticMatch) {
          return prev.map((m) =>
            m === optimisticMatch ? { ...m, ...message } : m,
          );
        }
      }

      return [...prev, message].sort(
        (a, b) =>
          new Date(a.messageTimestamp).getTime() -
          new Date(b.messageTimestamp).getTime(),
      );
    });
  }, []);

  return {
    messages,
    loading,
    hasMore,
    loadOlder,
    refresh,
    addOptimisticMessage,
    updateMessageByTempId,
    updateMessageById,
    updateMessageByWahaId,
    addMessage,
  };
};
