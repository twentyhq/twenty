import { type DictationSurface } from '@/ai/dictation/types/DictationSurface';

// On iOS the Web Speech API is exposed inside installed PWAs and third-party
// browsers (all WKWebView) but never emits, so these surfaces would otherwise
// cost the user a recording before failing.
const isWebSpeechKnownDead = (surface: DictationSurface) =>
  surface.isIOS &&
  (surface.isStandaloneDisplayMode || surface.isThirdPartyIOSBrowser);

// hasMediaDevices matters even though recognition does its own capture: the
// engine warms the microphone through getUserMedia first, so a WebView that
// exposes SpeechRecognition without it would offer a button that fails on
// every press. Opening a microphone at all is gated on a secure context.
export const resolveDictationAvailability = (
  surface: DictationSurface,
): boolean =>
  surface.isSecureContext &&
  surface.hasSpeechRecognition &&
  surface.hasMediaDevices &&
  !isWebSpeechKnownDead(surface);
