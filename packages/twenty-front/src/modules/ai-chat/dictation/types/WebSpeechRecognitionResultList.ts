import { type WebSpeechRecognitionResult } from '@/ai-chat/dictation/types/WebSpeechRecognitionResult';

export type WebSpeechRecognitionResultList = {
  length: number;
  [index: number]: WebSpeechRecognitionResult;
};
