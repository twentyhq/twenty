import {
  resolveDictationEngineChoice,
  type DictationSurface,
} from '@/ai/dictation/utils/resolveDictationEngineChoice';

const CAPABLE_DESKTOP_SURFACE: DictationSurface = {
  isIOS: false,
  isStandaloneDisplayMode: false,
  isThirdPartyIOSBrowser: false,
  hasSpeechRecognition: true,
  hasMediaRecorder: true,
  hasMediaDevices: true,
  isSecureContext: true,
};

describe('resolveDictationEngineChoice', () => {
  it('picks the cloud engine when the server configured one', () => {
    expect(
      resolveDictationEngineChoice({
        mode: 'cloud',
        surface: CAPABLE_DESKTOP_SURFACE,
      }),
    ).toEqual({ status: 'available', tier: 'cloud' });
  });

  it('picks the local engine when the server configured no provider', () => {
    expect(
      resolveDictationEngineChoice({
        mode: 'local',
        surface: CAPABLE_DESKTOP_SURFACE,
      }),
    ).toEqual({ status: 'available', tier: 'local' });
  });

  it.each(['cloud', 'local'] as const)(
    'refuses %s without a secure context, since the microphone is gated on it',
    (mode) => {
      expect(
        resolveDictationEngineChoice({
          mode,
          surface: { ...CAPABLE_DESKTOP_SURFACE, isSecureContext: false },
        }),
      ).toEqual({ status: 'unavailable', reason: 'unsupported-surface' });
    },
  );

  // The Web Speech API is exposed in these iOS contexts but never emits, so
  // they are refused before a recording is spent proving it.
  it('refuses the local engine in an installed iOS app', () => {
    expect(
      resolveDictationEngineChoice({
        mode: 'local',
        surface: {
          ...CAPABLE_DESKTOP_SURFACE,
          isIOS: true,
          isStandaloneDisplayMode: true,
        },
      }),
    ).toEqual({ status: 'unavailable', reason: 'unsupported-surface' });
  });

  it('refuses the local engine in a third-party iOS browser', () => {
    expect(
      resolveDictationEngineChoice({
        mode: 'local',
        surface: {
          ...CAPABLE_DESKTOP_SURFACE,
          isIOS: true,
          isThirdPartyIOSBrowser: true,
        },
      }),
    ).toEqual({ status: 'unavailable', reason: 'unsupported-surface' });
  });

  it('still offers the local engine in iOS Safari itself', () => {
    expect(
      resolveDictationEngineChoice({
        mode: 'local',
        surface: { ...CAPABLE_DESKTOP_SURFACE, isIOS: true },
      }),
    ).toEqual({ status: 'available', tier: 'local' });
  });

  // The cloud engine records rather than recognising, and recording works on
  // every iOS surface the speech API is dead on.
  it('offers the cloud engine in an installed iOS app', () => {
    expect(
      resolveDictationEngineChoice({
        mode: 'cloud',
        surface: {
          ...CAPABLE_DESKTOP_SURFACE,
          isIOS: true,
          isStandaloneDisplayMode: true,
          hasSpeechRecognition: false,
        },
      }),
    ).toEqual({ status: 'available', tier: 'cloud' });
  });

  it('refuses the cloud engine without MediaRecorder', () => {
    expect(
      resolveDictationEngineChoice({
        mode: 'cloud',
        surface: { ...CAPABLE_DESKTOP_SURFACE, hasMediaRecorder: false },
      }),
    ).toEqual({ status: 'unavailable', reason: 'unsupported-surface' });
  });

  it('refuses the local engine without speech recognition', () => {
    expect(
      resolveDictationEngineChoice({
        mode: 'local',
        surface: { ...CAPABLE_DESKTOP_SURFACE, hasSpeechRecognition: false },
      }),
    ).toEqual({ status: 'unavailable', reason: 'unsupported-surface' });
  });
});
