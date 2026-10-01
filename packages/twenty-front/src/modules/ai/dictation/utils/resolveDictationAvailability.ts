import { type DictationSurface } from '@/ai/dictation/types/DictationSurface';

// iOS PWAs and third-party browsers (all WKWebView) expose Web Speech but it never emits, costing a recording before failing.
const isWebSpeechKnownDead = (surface: DictationSurface) =>
  surface.isIOS &&
  (surface.isStandaloneDisplayMode || surface.isThirdPartyIOSBrowser);

// hasMediaDevices is required: the engine warms the microphone through getUserMedia first, which needs a secure context.
export const resolveDictationAvailability = (
  surface: DictationSurface,
): boolean =>
  surface.isSecureContext &&
  surface.hasSpeechRecognition &&
  surface.hasMediaDevices &&
  !isWebSpeechKnownDead(surface);
