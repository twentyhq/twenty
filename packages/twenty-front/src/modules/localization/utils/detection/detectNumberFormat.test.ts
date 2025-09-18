import { detectNumberFormat } from '@/localization/utils/detection/detectNumberFormat';

// Mock navigator.language
Object.defineProperty(navigator, 'language', {
  writable: true,
  value: 'en-US',
});

describe('detectNumberFormat', () => {
  beforeEach(() => {
    // Reset to default
    Object.defineProperty(navigator, 'language', {
      writable: true,
      value: 'en-US',
    });
  });

  it('should detect COMMAS_AND_DOT format for en-US locale', () => {
    Object.defineProperty(navigator, 'language', {
      writable: true,
      value: 'en-US',
    });
    expect(detectNumberFormat()).toBe('COMMAS_AND_DOT');
  });

  it('should detect SPACES_AND_COMMA format for fr-FR locale', () => {
    Object.defineProperty(navigator, 'language', {
      writable: true,
      value: 'fr-FR',
    });
    expect(detectNumberFormat()).toBe('SPACES_AND_COMMA');
  });

  it('should detect DOTS_AND_COMMA format for de-DE locale', () => {
    Object.defineProperty(navigator, 'language', {
      writable: true,
      value: 'de-DE',
    });
    expect(detectNumberFormat()).toBe('DOTS_AND_COMMA');
  });

  it('should detect APOSTROPHE_AND_DOT format for de-CH locale', () => {
    Object.defineProperty(navigator, 'language', {
      writable: true,
      value: 'de-CH',
    });
    expect(detectNumberFormat()).toBe('APOSTROPHE_AND_DOT');
  });

  it('should fallback to COMMAS_AND_DOT for unknown patterns', () => {
    Object.defineProperty(navigator, 'language', {
      writable: true,
      value: 'ja-JP', // Uses different separators not in our patterns
    });
    expect(detectNumberFormat()).toBe('COMMAS_AND_DOT');
  });

  it('should handle invalid locale gracefully', () => {
    Object.defineProperty(navigator, 'language', {
      writable: true,
      value: 'invalid-locale',
    });
    expect(detectNumberFormat()).toBe('COMMAS_AND_DOT');
  });

  it('should handle missing navigator.language', () => {
    Object.defineProperty(navigator, 'language', {
      writable: true,
      value: undefined,
    });
    expect(detectNumberFormat()).toBe('COMMAS_AND_DOT');
  });
});
