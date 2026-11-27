import { isDefined } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';

import { getSpeechRecognitionConstructor } from '@/ai-chat/dictation/utils/getSpeechRecognitionConstructor';
import { type DictationSurface } from '@/ai-chat/dictation/types/DictationSurface';

const THIRD_PARTY_IOS_BROWSER_PATTERN = /CriOS|FxiOS|EdgiOS|OPiOS/;
const IOS_DEVICE_PATTERN = /iPad|iPhone|iPod/;

type StandaloneNavigator = { standalone?: boolean };

const getIsIPadReportingAsMac = (): boolean =>
  navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;

const getIsIOS = (userAgent: string): boolean =>
  IOS_DEVICE_PATTERN.test(userAgent) || getIsIPadReportingAsMac();

const getIsStandaloneDisplayMode = (): boolean =>
  (isDefined(window.matchMedia) &&
    window.matchMedia(doNotTranslate('(display-mode: standalone)')).matches) ||
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
