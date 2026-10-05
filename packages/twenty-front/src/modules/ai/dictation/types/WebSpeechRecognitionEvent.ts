import { type WebSpeechRecognitionResultList } from '@/ai/dictation/types/WebSpeechRecognitionResultList';

export type WebSpeechRecognitionEvent = {
  resultIndex: number;
  results: WebSpeechRecognitionResultList;
};
