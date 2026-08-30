import { isDefined } from 'twenty-shared/utils';

import { type WebSpeechRecognitionConstructor } from '@/ai/dictation/types/WebSpeechRecognition';

type SpeechRecognitionWindow = {
  SpeechRecognition?: WebSpeechRecognitionConstructor;
  webkitSpeechRecognition?: WebSpeechRecognitionConstructor;
};

export const getSpeechRecognitionConstructor = ():
  | WebSpeechRecognitionConstructor
  | undefined => {
  if (typeof window === 'undefined') {
    return undefined;
  }

  const speechRecognitionWindow = window as unknown as SpeechRecognitionWindow;
  const constructor =
    speechRecognitionWindow.SpeechRecognition ??
    speechRecognitionWindow.webkitSpeechRecognition;

  return isDefined(constructor) ? constructor : undefined;
};
