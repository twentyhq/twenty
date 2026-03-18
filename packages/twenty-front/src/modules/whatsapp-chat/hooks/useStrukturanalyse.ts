import { useCallback, useEffect, useRef, useState } from 'react';

import { useWhatsAppBridge } from '@/whatsapp-chat/hooks/useWhatsAppBridge';

export interface SaResult {
  run_id: string;
  picture_id?: string;
  status: string;
  original_image_b64?: string | null;
  annotated_image_b64?: string | null;
  analysis_text?: string | null;
  error?: string | null;
  created_at: string;
}

interface TriggerResponse {
  picture_id: string;
  status: string;
  langgraph_run_id?: string;
}

interface TriggerParams {
  messageId: string;
  sessionName: string;
  conversationId: string;
  email?: string;
  heightCm?: number;
}

interface SendParams {
  runId: string;
  sessionName: string;
  toJid: string;
  conversationId: string;
  caption?: string;
  imageType?: 'original' | 'annotated';
}

export const useStrukturanalyse = (conversationId: string | null) => {
  const { bridgeFetch } = useWhatsAppBridge();
  const [results, setResults] = useState<SaResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [pendingPictureId, setPendingPictureId] = useState<string | null>(null);

  // Callback ref for when a run completes via WebSocket
  const onCompleteRef = useRef<((pictureId: string) => void) | null>(null);

  const fetchResults = useCallback(async () => {
    if (!conversationId) return;

    setLoading(true);
    try {
      const data = await bridgeFetch<{ items: SaResult[] }>(
        `/api/v1/strukturanalyse/results/${conversationId}`,
      );
      setResults(data.items ?? []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [bridgeFetch, conversationId]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  /**
   * Trigger SA — returns immediately with picture_id + "pending" status.
   * The actual result arrives via WebSocket `strukturanalyse.complete` event.
   */
  const triggerAnalysis = useCallback(
    async (params: TriggerParams): Promise<TriggerResponse | null> => {
      setPendingPictureId(null);
      try {
        const resp = await bridgeFetch<TriggerResponse>(
          '/api/v1/strukturanalyse/run',
          {
            method: 'POST',
            body: JSON.stringify({
              message_id: params.messageId,
              session_name: params.sessionName,
              conversation_id: params.conversationId,
              ...(params.email ? { email: params.email } : {}),
              ...(params.heightCm ? { height_cm: params.heightCm } : {}),
            }),
          },
        );
        setPendingPictureId(resp.picture_id);
        return resp;
      } catch {
        return null;
      }
    },
    [bridgeFetch],
  );

  const getFullResult = useCallback(
    async (pictureId: string): Promise<SaResult | null> => {
      try {
        return await bridgeFetch<SaResult>(
          `/api/v1/strukturanalyse/result/${pictureId}`,
        );
      } catch {
        return null;
      }
    },
    [bridgeFetch],
  );

  const sendImage = useCallback(
    async (params: SendParams): Promise<boolean> => {
      try {
        await bridgeFetch('/api/v1/strukturanalyse/send', {
          method: 'POST',
          body: JSON.stringify({
            run_id: params.runId,
            session_name: params.sessionName,
            to_jid: params.toJid,
            conversation_id: params.conversationId,
            caption: params.caption,
            image_type: params.imageType ?? 'annotated',
          }),
        });
        return true;
      } catch {
        return false;
      }
    },
    [bridgeFetch],
  );

  /**
   * Called from the container when a `strukturanalyse.complete` WS event arrives.
   */
  const handleWsComplete = useCallback(
    (pictureId: string, status: string) => {
      if (pictureId === pendingPictureId) {
        if (status === 'completed') {
          onCompleteRef.current?.(pictureId);
        }
        setPendingPictureId(null);
      }
      // Refresh the list either way
      fetchResults();
    },
    [pendingPictureId, fetchResults],
  );

  /** Register a callback for when the pending run completes. */
  const setOnComplete = useCallback((cb: ((pictureId: string) => void) | null) => {
    onCompleteRef.current = cb;
  }, []);

  return {
    results,
    loading,
    pendingPictureId,
    triggerAnalysis,
    getFullResult,
    sendImage,
    fetchResults,
    handleWsComplete,
    setOnComplete,
  };
};
