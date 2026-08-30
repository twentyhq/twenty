import { type DictationFailureReason } from '@/ai/dictation/types/DictationEngine';

export type DictationSurface = {
  isIOS: boolean;
  isStandaloneDisplayMode: boolean;
  isThirdPartyIOSBrowser: boolean;
  hasSpeechRecognition: boolean;
  hasMediaDevices: boolean;
  isSecureContext: boolean;
};

export type DictationAvailabilityResult =
  | { status: 'available' }
  | { status: 'unavailable'; reason: DictationFailureReason };

// On iOS the Web Speech API is exposed inside installed PWAs and third-party
// browsers (all WKWebView) but never emits, so these surfaces would otherwise
// cost the user a recording before failing.
const isWebSpeechKnownDead = (surface: DictationSurface) =>
  surface.isIOS &&
  (surface.isStandaloneDisplayMode || surface.isThirdPartyIOSBrowser);

export const resolveDictationAvailability = (
  surface: DictationSurface,
): DictationAvailabilityResult => {
  // Opening a microphone is gated on a secure context.
  if (!surface.isSecureContext) {
    return { status: 'unavailable', reason: 'unsupported-surface' };
  }

  // hasMediaDevices matters even though recognition does its own capture: the
  // engine warms the microphone through getUserMedia first, so a WebView that
  // exposes SpeechRecognition without it would offer a button that fails on
  // every press.
  if (
    !surface.hasSpeechRecognition ||
    !surface.hasMediaDevices ||
    isWebSpeechKnownDead(surface)
  ) {
    return { status: 'unavailable', reason: 'unsupported-surface' };
  }

  return { status: 'available' };
};
