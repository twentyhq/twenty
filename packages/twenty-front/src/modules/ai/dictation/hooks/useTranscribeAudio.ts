import { useCallback } from 'react';

import { type TranscribeDictationAudio } from '@/ai/dictation/types/DictationTranscriptionResult';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

const CREDITS_EXHAUSTED_STATUS = 402;
const SERVICE_UNAVAILABLE_STATUS = 503;

export const useTranscribeAudio = (): TranscribeDictationAudio => {
  return useCallback(async (audio: Blob) => {
    try {
      // The recording is the body: base64 in JSON would inflate it by a third
      // and hold the whole clip in memory as a string on both ends.
      const response = await fetch(
        `${REACT_APP_SERVER_BASE_URL}/rest/ai/transcribe`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': audio.type },
          body: audio,
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
  }, []);
};
