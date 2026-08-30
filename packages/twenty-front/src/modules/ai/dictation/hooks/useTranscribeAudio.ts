import { useCallback } from 'react';
import { useStore } from 'jotai';

import { getAuthorizationHeaders } from '@/auth/utils/getAuthorizationHeaders';
import { type TranscribeDictationAudio } from '@/ai/dictation/types/DictationTranscriptionResult';
import { readBlobAsBase64 } from '@/ai/dictation/utils/readBlobAsBase64';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

const CREDITS_EXHAUSTED_STATUS = 402;
const SERVICE_UNAVAILABLE_STATUS = 503;

export const useTranscribeAudio = (): TranscribeDictationAudio => {
  const store = useStore();

  return useCallback(
    async (audio: Blob, language: string) => {
      let audioBase64: string;

      try {
        audioBase64 = await readBlobAsBase64(audio);
      } catch {
        return { status: 'failed' as const, reason: 'engine-error' as const };
      }

      try {
        const response = await fetch(
          `${REACT_APP_SERVER_BASE_URL}/rest/ai/transcribe`,
          {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              ...getAuthorizationHeaders(store),
            },
            body: JSON.stringify({ audioBase64, language }),
          },
        );

        if (!response.ok) {
          if (response.status === CREDITS_EXHAUSTED_STATUS) {
            return {
              status: 'failed' as const,
              reason: 'quota-exhausted' as const,
            };
          }

          return {
            status: 'failed' as const,
            reason:
              response.status === SERVICE_UNAVAILABLE_STATUS
                ? ('service-unavailable' as const)
                : ('network' as const),
          };
        }

        const body: { text?: string } = await response.json();

        return { status: 'transcribed' as const, text: body.text ?? '' };
      } catch {
        return { status: 'failed' as const, reason: 'network' as const };
      }
    },
    [store],
  );
};
