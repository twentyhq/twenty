import { type WebSpeechRecognitionResultList } from '@/ai-chat/dictation/types/WebSpeechRecognitionResultList';

export type WebSpeechRecognitionEvent = {
  resultIndex: number;
  results: WebSpeechRecognitionResultList;
};
