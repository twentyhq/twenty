import { type DictationMode } from 'twenty-shared/ai';

import {
  type DictationFailureReason,
  type DictationTier,
} from '@/ai/dictation/types/DictationEngine';

export type DictationSurface = {
  isIOS: boolean;
  isStandaloneDisplayMode: boolean;
  isThirdPartyIOSBrowser: boolean;
  hasSpeechRecognition: boolean;
  hasMediaRecorder: boolean;
  hasMediaDevices: boolean;
  isSecureContext: boolean;
};

export type DictationEngineChoice =
  | { status: 'available'; tier: DictationTier }
  | { status: 'unavailable'; reason: DictationFailureReason };

// Refused up front rather than left to the watchdog: on iOS the Web Speech API
// is exposed inside installed PWAs and third-party browsers (all WKWebView)
// but never emits, so these surfaces would otherwise cost the user a recording
// before failing.
const isWebSpeechKnownDead = (surface: DictationSurface) =>
  surface.isIOS &&
  (surface.isStandaloneDisplayMode || surface.isThirdPartyIOSBrowser);

export const resolveDictationEngineChoice = ({
  mode,
  surface,
}: {
  mode: Exclude<DictationMode, 'disabled'>;
  surface: DictationSurface;
}): DictationEngineChoice => {
  // Both tiers open a microphone, which browsers gate on a secure context.
  if (!surface.isSecureContext) {
    return { status: 'unavailable', reason: 'unsupported-surface' };
  }

  if (mode === 'cloud') {
    return surface.hasMediaRecorder && surface.hasMediaDevices
      ? { status: 'available', tier: 'cloud' }
      : { status: 'unavailable', reason: 'unsupported-surface' };
  }

  if (!surface.hasSpeechRecognition || isWebSpeechKnownDead(surface)) {
    return { status: 'unavailable', reason: 'unsupported-surface' };
  }

  return { status: 'available', tier: 'local' };
};
