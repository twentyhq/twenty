import { type WebSpeechRecognitionAlternative } from '@/ai-chat/dictation/types/WebSpeechRecognitionAlternative';

export type WebSpeechRecognitionResult = {
  isFinal: boolean;
  [index: number]: WebSpeechRecognitionAlternative;
};
