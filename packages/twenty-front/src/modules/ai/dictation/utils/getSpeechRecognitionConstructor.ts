import { type WebSpeechRecognitionConstructor } from '@/ai/dictation/types/WebSpeechRecognition';

type SpeechRecognitionWindow = {
  SpeechRecognition?: WebSpeechRecognitionConstructor;
  webkitSpeechRecognition?: WebSpeechRecognitionConstructor;
};

export const getSpeechRecognitionConstructor = ():
  | WebSpeechRecognitionConstructor
  | undefined => {
  const speechRecognitionWindow = window as unknown as SpeechRecognitionWindow;

  return (
    speechRecognitionWindow.SpeechRecognition ??
    speechRecognitionWindow.webkitSpeechRecognition
  );
};
