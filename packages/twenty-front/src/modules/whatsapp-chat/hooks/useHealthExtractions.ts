import { useCallback, useEffect, useState } from 'react';

import { useWhatsAppBridge } from '@/whatsapp-chat/hooks/useWhatsAppBridge';

export interface HealthExtraction {
  extractionKey: string;
  extractionValue: string | null;
  extractionsJson: string | null;
  extractionCount: number;
  model: string | null;
  touchpointCount: number;
  lastTouchpointAt: string | null;
}

interface HealthExtractionsResponse {
  email: string;
  extractions: Record<string, HealthExtraction>;
}

// Display labels for extraction keys
export const EXTRACTION_LABELS: Record<string, string> = {
  symptoms: 'Symptome',
  pain_duration: 'Schmerzdauer',
  pain_severity: 'Schmerzlevel',
  past_treatments: 'Bisherige Behandlungen',
  dreams_desires: 'Ziele & Wünsche',
  life_situation: 'Lebenssituation',
  objections: 'Einwände',
  gender: 'Geschlecht',
  relatives: 'Angehörige',
  phone_number: 'Telefonnummer',
};

export interface ParsedExtraction {
  extraction: string;
  source_id?: string;
}

export function parseExtractionsJson(
  raw: string | null,
): ParsedExtraction[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export const useHealthExtractions = (email: string | undefined) => {
  const { bridgeFetch } = useWhatsAppBridge();
  const [extractions, setExtractions] = useState<
    Record<string, HealthExtraction>
  >({});
  const [loading, setLoading] = useState(false);

  const fetchExtractions = useCallback(async () => {
    if (!email) {
      setExtractions({});
      return;
    }

    setLoading(true);
    try {
      const data = await bridgeFetch<HealthExtractionsResponse>(
        `/api/v1/health-extractions/by-email/${encodeURIComponent(email)}`,
      );
      setExtractions(data.extractions);
    } catch {
      setExtractions({});
    } finally {
      setLoading(false);
    }
  }, [bridgeFetch, email]);

  useEffect(() => {
    fetchExtractions();
  }, [fetchExtractions]);

  // Computed: only extractions with actual data
  const filledExtractions = Object.values(extractions).filter(
    (e) => e.extractionCount > 0 || (e.extractionValue && e.extractionValue.trim() !== ''),
  );

  const hasData = filledExtractions.length > 0;

  return { extractions, filledExtractions, loading, hasData };
};
