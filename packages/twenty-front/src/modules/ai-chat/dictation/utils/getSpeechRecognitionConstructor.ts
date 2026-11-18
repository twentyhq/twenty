import { type WebSpeechRecognitionConstructor } from '@/ai-chat/dictation/types/WebSpeechRecognitionConstructor';

declare global {
  interface Window {
    SpeechRecognition?: WebSpeechRecognitionConstructor;
    webkitSpeechRecognition?: WebSpeechRecognitionConstructor;
  }
}

export const getSpeechRecognitionConstructor = ():
  | WebSpeechRecognitionConstructor
  | undefined => {
  return window.SpeechRecognition ?? window.webkitSpeechRecognition;
};
