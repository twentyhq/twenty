import { useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

export type TranscriptTimestamp = {
  relative: number;
  absolute: string;
};

export type TranscriptWord = {
  text: string;
  start_timestamp?: TranscriptTimestamp;
  end_timestamp?: TranscriptTimestamp;
};

export type TranscriptEntry = {
  participant: {
    name: string | null;
  };
  words: TranscriptWord[];
};

export const useTranscript = (
  transcriptFileUrl: string | null | undefined,
) => {
  const [entries, setEntries] = useState<TranscriptEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!isDefined(transcriptFileUrl)) {
      return;
    }

    const fetchTranscript = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(transcriptFileUrl);

        if (!response.ok) {
          throw new Error(`Failed to fetch transcript: ${response.statusText}`);
        }

        const data = await response.json();

        setEntries(data);
      } catch (fetchError) {
        if (fetchError instanceof Error) {
          setError(fetchError);
        } else {
          setError(new Error('Failed to fetch transcript'));
        }
      }

      setLoading(false);
    };

    fetchTranscript();

    return () => {
      setEntries([]);
      setLoading(false);
      setError(null);
    };
  }, [transcriptFileUrl]);

  return { entries, loading, error };
};
