import { type DictationSurface } from '@/ai-chat/dictation/types/DictationSurface';

const isWebSpeechKnownDead = (surface: DictationSurface) =>
  surface.isIOS &&
  (surface.isStandaloneDisplayMode || surface.isThirdPartyIOSBrowser);

export const resolveDictationAvailability = (
  surface: DictationSurface,
): boolean =>
  surface.isSecureContext &&
  surface.hasSpeechRecognition &&
  surface.hasMediaDevices &&
  !isWebSpeechKnownDead(surface);
