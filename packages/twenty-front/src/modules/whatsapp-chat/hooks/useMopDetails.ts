import { useCallback, useEffect, useState } from 'react';

import { useWhatsAppBridge } from '@/whatsapp-chat/hooks/useWhatsAppBridge';

export interface MopRecord {
  id: string;
  email: string;
  marketingOfferId: string;
  marketingOfferName: string;
  attendedSession: boolean;
  totalWatchTime: number;
  hasConverted: boolean;
  docusealIsSigned: boolean;
  completedStrukturanalyse: boolean | null;
  mopZoomLastActive: string | null;
}

interface MopDetailsResponse {
  items: MopRecord[];
  total: number;
}

export const useMopDetails = (email: string | null | undefined) => {
  const { bridgeFetch } = useWhatsAppBridge();
  const [records, setRecords] = useState<MopRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDetails = useCallback(async () => {
    if (!email) {
      setRecords([]);
      return;
    }

    setLoading(true);

    try {
      const data = await bridgeFetch<MopDetailsResponse>(
        `/api/v1/mop/details/${encodeURIComponent(email)}`,
      );
      setRecords(data.items ?? []);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [bridgeFetch, email]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  return { records, loading };
};
