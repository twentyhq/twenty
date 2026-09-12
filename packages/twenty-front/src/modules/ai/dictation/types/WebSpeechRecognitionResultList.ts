import { type WebSpeechRecognitionResult } from '@/ai/dictation/types/WebSpeechRecognitionResult';

export type WebSpeechRecognitionResultList = {
  length: number;
  [index: number]: WebSpeechRecognitionResult;
};
