import { type WebSpeechRecognitionErrorEvent } from '@/ai/dictation/types/WebSpeechRecognitionErrorEvent';
import { type WebSpeechRecognitionEvent } from '@/ai/dictation/types/WebSpeechRecognitionEvent';

// The Web Speech API is not in TypeScript's DOM lib because it never became a
// standard, so the parts this engine touches are declared structurally.
export type WebSpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onaudiostart: (() => void) | null;
  onresult: ((event: WebSpeechRecognitionEvent) => void) | null;
  onerror: ((event: WebSpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
};
