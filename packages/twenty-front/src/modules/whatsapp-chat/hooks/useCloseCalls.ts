import { useCallback, useEffect, useState } from 'react';

import { useWhatsAppBridge } from '@/whatsapp-chat/hooks/useWhatsAppBridge';

export interface CloseCall {
  id: string;
  phone: string | null;
  direction: string | null;
  duration: number | null;
  status: string | null;
  disposition: string | null;
  note: string | null;
  summary: string | null;
  userName: string | null;
  dateCreated: string | null;
  leadId: string | null;
}

interface CloseCallsResponse {
  items: CloseCall[];
  total: number;
}

export const useCloseCalls = (phone: string | undefined) => {
  const { bridgeFetch } = useWhatsAppBridge();
  const [calls, setCalls] = useState<CloseCall[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCalls = useCallback(async () => {
    if (!phone) {
      setCalls([]);
      return;
    }

    setLoading(true);

    try {
      const data = await bridgeFetch<CloseCallsResponse>(
        `/api/v1/close/calls/${encodeURIComponent(phone)}`,
      );
      setCalls(data.items);
    } catch {
      setCalls([]);
    } finally {
      setLoading(false);
    }
  }, [bridgeFetch, phone]);

  useEffect(() => {
    fetchCalls();
  }, [fetchCalls]);

  return { calls, loading, refetch: fetchCalls };
};
