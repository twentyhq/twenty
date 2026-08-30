import { type WebSpeechRecognitionAlternative } from '@/ai/dictation/types/WebSpeechRecognitionAlternative';

export type WebSpeechRecognitionResult = {
  isFinal: boolean;
  [index: number]: WebSpeechRecognitionAlternative;
};
