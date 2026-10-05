import { type DictationSurface } from '@/ai/dictation/types/DictationSurface';
import { resolveDictationAvailability } from '@/ai/dictation/utils/resolveDictationAvailability';

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
    expect(resolveDictationAvailability(CAPABLE_DESKTOP_SURFACE)).toBe(true);
  });

  it('refuses without a secure context, since the microphone is gated on it', () => {
    expect(
      resolveDictationAvailability({
        ...CAPABLE_DESKTOP_SURFACE,
        isSecureContext: false,
      }),
    ).toBe(false);
  });

  it('refuses without speech recognition', () => {
    expect(
      resolveDictationAvailability({
        ...CAPABLE_DESKTOP_SURFACE,
        hasSpeechRecognition: false,
      }),
    ).toBe(false);
  });

  it('refuses an installed iOS app', () => {
    expect(
      resolveDictationAvailability({
        ...CAPABLE_DESKTOP_SURFACE,
        isIOS: true,
        isStandaloneDisplayMode: true,
      }),
    ).toBe(false);
  });

  it('refuses a third-party iOS browser', () => {
    expect(
      resolveDictationAvailability({
        ...CAPABLE_DESKTOP_SURFACE,
        isIOS: true,
        isThirdPartyIOSBrowser: true,
      }),
    ).toBe(false);
  });

  it('still offers dictation in iOS Safari itself', () => {
    expect(
      resolveDictationAvailability({
        ...CAPABLE_DESKTOP_SURFACE,
        isIOS: true,
      }),
    ).toBe(true);
  });

  it('refuses a surface with no microphone capture support', () => {
    expect(
      resolveDictationAvailability({
        ...CAPABLE_DESKTOP_SURFACE,
        hasMediaDevices: false,
      }),
    ).toBe(false);
  });
});
