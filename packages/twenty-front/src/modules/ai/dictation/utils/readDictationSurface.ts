import { isDefined } from 'twenty-shared/utils';

import { getSpeechRecognitionConstructor } from '@/ai/dictation/utils/getSpeechRecognitionConstructor';
import { type DictationSurface } from '@/ai/dictation/types/DictationSurface';

// Every iOS browser is WKWebView, so third-party ones are detected by name.
const THIRD_PARTY_IOS_BROWSER_PATTERN = /CriOS|FxiOS|EdgiOS|OPiOS/;
const IOS_DEVICE_PATTERN = /iPad|iPhone|iPod/;

type StandaloneNavigator = { standalone?: boolean };

const getIsIOS = (userAgent: string): boolean =>
  IOS_DEVICE_PATTERN.test(userAgent) ||
  // iPadOS reports itself as a Mac; the touch points are what give it away.
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

// matchMedia is missing from some embedded WebViews, so fall back to the legacy iOS flag.
const getIsStandaloneDisplayMode = (): boolean =>
  (isDefined(window.matchMedia) &&
    window.matchMedia('(display-mode: standalone)').matches) ||
  (navigator as StandaloneNavigator).standalone === true;

export const readDictationSurface = (): DictationSurface => {
  const userAgent = navigator.userAgent;

  return {
    isIOS: getIsIOS(userAgent),
    isStandaloneDisplayMode: getIsStandaloneDisplayMode(),
    isThirdPartyIOSBrowser: THIRD_PARTY_IOS_BROWSER_PATTERN.test(userAgent),
    hasSpeechRecognition: isDefined(getSpeechRecognitionConstructor()),
    hasMediaDevices: isDefined(navigator.mediaDevices?.getUserMedia),
    isSecureContext: window.isSecureContext,
  };
};
