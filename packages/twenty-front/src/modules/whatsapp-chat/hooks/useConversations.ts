import { useCallback, useEffect, useRef, useState } from 'react';

import { useWhatsAppBridge } from '@/whatsapp-chat/hooks/useWhatsAppBridge';
import {
  type ConversationsResponse,
  type WaConversation,
} from '@/whatsapp-chat/types/WhatsAppTypes';

interface UseConversationsOptions {
  session?: string;
  search?: string;
  sort?: 'newest' | 'oldest';
  limit?: number;
}

export const useConversations = ({
  session,
  search,
  sort,
  limit = 50,
}: UseConversationsOptions = {}) => {
  const { bridgeFetch } = useWhatsAppBridge();

  const [conversations, setConversations] = useState<WaConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryCountRef = useRef(0);

  const cursorRef = useRef<string | undefined>(undefined);
  const lastGoodRef = useRef<WaConversation[]>([]);

  // Keep ref in sync with state
  cursorRef.current = cursor;

  const fetchConversations = useCallback(
    async (loadMore = false) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      if (!loadMore) {
        setLoading(true);
      }

      setError(null);

      try {
        const params = new URLSearchParams();

        if (session) {
          params.set('session', session);
        }

        if (search) {
          params.set('search', search);
        }

        if (loadMore && cursorRef.current) {
          params.set('cursor', cursorRef.current);
        }

        params.set('limit', String(limit));

        const queryString = params.toString();
        const path = `/api/v1/conversations${queryString ? `?${queryString}` : ''}`;

        const data = await bridgeFetch<ConversationsResponse>(path, {
          signal: controller.signal,
        });

        const items = data?.items ?? [];

        setConversations((prev) => (loadMore ? [...prev, ...items] : items));
        setCursor(data?.cursor ?? undefined);
        setHasMore(data?.hasMore ?? false);

        // Remember last successful non-search result for fallback
        if (!search && !loadMore) {
          lastGoodRef.current = items;
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }

        const message =
          err instanceof Error
            ? err.message
            : 'Failed to fetch conversations';
        setError(message);

        // On error, restore the last known good result so the list
        // doesn't stay empty after a failed search/fetch.
        if (!loadMore && lastGoodRef.current.length > 0) {
          setConversations(lastGoodRef.current);
        }

        // Auto-retry on failure with exponential backoff (max 3 retries)
        if (!loadMore) {
          const attempt = retryCountRef.current;
          if (attempt < 3) {
            retryCountRef.current = attempt + 1;
            const delay = Math.min(2000 * 2 ** attempt, 10000);
            retryTimeoutRef.current = setTimeout(() => {
              retryTimeoutRef.current = null;
              fetchConversations(false);
            }, delay);
          }
        }
      } finally {
        setLoading(false);
      }
    },
    [bridgeFetch, session, search, limit],
  );

  // Fetch all pages (used when sort=oldest to ensure full dataset)
  const fetchAll = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const allItems: WaConversation[] = [];
      let pageCursor: string | undefined;

      while (true) {
        const params = new URLSearchParams();
        if (session) params.set('session', session);
        if (search) params.set('search', search);
        if (pageCursor) params.set('cursor', pageCursor);
        params.set('limit', '100');

        const path = `/api/v1/conversations?${params.toString()}`;
        const data = await bridgeFetch<ConversationsResponse>(path, {
          signal: controller.signal,
        });

        allItems.push(...(data?.items ?? []));

        if (!data?.hasMore) break;
        pageCursor = data?.cursor ?? undefined;
        if (!pageCursor) break;
      }

      setConversations(allItems);
      setCursor(undefined);
      setHasMore(false);

      if (!search) {
        lastGoodRef.current = allItems;
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      setError(
        err instanceof Error ? err.message : 'Failed to fetch conversations',
      );
    } finally {
      setLoading(false);
    }
  }, [bridgeFetch, session, search]);

  useEffect(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    retryCountRef.current = 0;

    if (sort === 'oldest') {
      fetchAll();
    } else {
      fetchConversations(false);
    }

    return () => {
      abortRef.current?.abort();
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, search, sort]);

  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      fetchConversations(true);
    }
  }, [hasMore, loading, fetchConversations]);

  const refresh = useCallback(() => {
    fetchConversations(false);
  }, [fetchConversations]);

  // When backend sort is active, preserve its ordering (only float pinned items).
  // Otherwise default to newest-first.
  const sortedConversations = [...conversations].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;

    if (sort === 'oldest') {
      return (
        new Date(a.lastMessageAt).getTime() -
        new Date(b.lastMessageAt).getTime()
      );
    }

    return (
      new Date(b.lastMessageAt).getTime() -
      new Date(a.lastMessageAt).getTime()
    );
  });

  const updateConversation = useCallback(
    (id: string, updates: Partial<WaConversation>) => {
      setConversations((prev) =>
        prev.map((conv) => (conv.id === id ? { ...conv, ...updates } : conv)),
      );
    },
    [],
  );

  const addOrUpdateConversation = useCallback(
    (conversation: WaConversation) => {
      setConversations((prev) => {
        const index = prev.findIndex((c) => c.id === conversation.id);

        if (index >= 0) {
          const next = [...prev];
          next[index] = conversation;

          return next;
        }

        return [conversation, ...prev];
      });
    },
    [],
  );

  return {
    conversations: sortedConversations,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    updateConversation,
    addOrUpdateConversation,
  };
};
