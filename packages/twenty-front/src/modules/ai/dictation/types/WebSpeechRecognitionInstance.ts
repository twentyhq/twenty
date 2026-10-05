import { type WebSpeechRecognitionErrorEvent } from '@/ai/dictation/types/WebSpeechRecognitionErrorEvent';
import { type WebSpeechRecognitionEvent } from '@/ai/dictation/types/WebSpeechRecognitionEvent';

// The Web Speech API isn't in TypeScript's DOM lib, so it's declared structurally.
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
