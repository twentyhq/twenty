import { useCallback, useEffect, useState } from 'react';

import { useWhatsAppBridge } from '@/whatsapp-chat/hooks/useWhatsAppBridge';

export interface MopSummary {
  email: string;
  mopCount: number;
  mopTotalWatchTimeMinutes: number;
  mopFirstSignupDate: string | null;
  mopLastActivityDate: string | null;
  mopLatestOfferName: string | null;
  mopLastCallDate: string | null;
  mopLastCallDurationSeconds: number | null;
}

interface MopSummaryResponse {
  data: MopSummary | null;
}

export const useMopSummary = (email: string | null | undefined) => {
  const { bridgeFetch } = useWhatsAppBridge();
  const [summary, setSummary] = useState<MopSummary | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchSummary = useCallback(async () => {
    if (!email) {
      setSummary(null);
      return;
    }

    setLoading(true);

    try {
      const data = await bridgeFetch<MopSummaryResponse>(
        `/api/v1/mop/summary/${encodeURIComponent(email)}`,
      );
      setSummary(data.data ?? null);
    } catch {
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [bridgeFetch, email]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return { summary, loading };
};
