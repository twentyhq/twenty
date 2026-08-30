import {
  resolveDictationAvailability,
  type DictationSurface,
} from '@/ai/dictation/utils/resolveDictationAvailability';

const CAPABLE_DESKTOP_SURFACE: DictationSurface = {
  isIOS: false,
  isStandaloneDisplayMode: false,
  isThirdPartyIOSBrowser: false,
  hasSpeechRecognition: true,
  hasMediaDevices: true,
  isSecureContext: true,
};

describe('resolveDictationAvailability', () => {
  it('offers dictation on a capable desktop browser', () => {
    expect(resolveDictationAvailability(CAPABLE_DESKTOP_SURFACE)).toEqual({
      status: 'available',
    });
  });

  it('refuses without a secure context, since the microphone is gated on it', () => {
    expect(
      resolveDictationAvailability({
        ...CAPABLE_DESKTOP_SURFACE,
        isSecureContext: false,
      }),
    ).toEqual({ status: 'unavailable', reason: 'unsupported-surface' });
  });

  it('refuses without speech recognition', () => {
    expect(
      resolveDictationAvailability({
        ...CAPABLE_DESKTOP_SURFACE,
        hasSpeechRecognition: false,
      }),
    ).toEqual({ status: 'unavailable', reason: 'unsupported-surface' });
  });

  // The Web Speech API is exposed in these iOS contexts but never emits, so
  // they are refused before a recording is spent proving it.
  it('refuses an installed iOS app', () => {
    expect(
      resolveDictationAvailability({
        ...CAPABLE_DESKTOP_SURFACE,
        isIOS: true,
        isStandaloneDisplayMode: true,
      }),
    ).toEqual({ status: 'unavailable', reason: 'unsupported-surface' });
  });

  it('refuses a third-party iOS browser', () => {
    expect(
      resolveDictationAvailability({
        ...CAPABLE_DESKTOP_SURFACE,
        isIOS: true,
        isThirdPartyIOSBrowser: true,
      }),
    ).toEqual({ status: 'unavailable', reason: 'unsupported-surface' });
  });

  it('still offers dictation in iOS Safari itself', () => {
    expect(
      resolveDictationAvailability({
        ...CAPABLE_DESKTOP_SURFACE,
        isIOS: true,
      }),
    ).toEqual({ status: 'available' });
  });

  // The engine warms the microphone through getUserMedia before recognition, so
  // a WebView exposing SpeechRecognition without it fails on every press.
  it('refuses a surface with no microphone capture support', () => {
    expect(
      resolveDictationAvailability({
        ...CAPABLE_DESKTOP_SURFACE,
        hasMediaDevices: false,
      }),
    ).toEqual({ status: 'unavailable', reason: 'unsupported-surface' });
  });
});
