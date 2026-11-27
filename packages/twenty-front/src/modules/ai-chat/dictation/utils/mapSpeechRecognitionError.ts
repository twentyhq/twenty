import { type DictationFailureReason } from '@/ai-chat/dictation/types/DictationFailureReason';

export const mapSpeechRecognitionError = (
  error: string,
): DictationFailureReason | undefined => {
  switch (error) {
    case 'not-allowed':
    case 'service-not-allowed':
      return 'permission-denied';
    case 'audio-capture':
      return 'no-device';
    case 'network':
      return 'network';
    case 'aborted':
    case 'no-speech':
      return undefined;
    default:
      return 'engine-error';
  }
};
