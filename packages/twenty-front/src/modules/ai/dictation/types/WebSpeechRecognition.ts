// The Web Speech API is not in TypeScript's DOM lib because it never became a
// standard, so the parts this engine touches are declared structurally.
export type WebSpeechRecognitionAlternative = {
  transcript: string;
};

export type WebSpeechRecognitionResult = {
  isFinal: boolean;
  [index: number]: WebSpeechRecognitionAlternative;
};

export type WebSpeechRecognitionResultList = {
  length: number;
  [index: number]: WebSpeechRecognitionResult;
};

export type WebSpeechRecognitionEvent = {
  resultIndex: number;
  results: WebSpeechRecognitionResultList;
};

export type WebSpeechRecognitionErrorEvent = {
  error: string;
};

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

export type WebSpeechRecognitionConstructor =
  new () => WebSpeechRecognitionInstance;
