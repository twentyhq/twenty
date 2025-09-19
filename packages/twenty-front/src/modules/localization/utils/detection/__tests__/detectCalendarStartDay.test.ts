import { detectCalendarStartDay } from '@/localization/utils/detection/detectCalendarStartDay';

// Mock navigator.language
Object.defineProperty(navigator, 'language', {
  writable: true,
  value: 'en-US',
});

describe('detectCalendarStartDay', () => {
  let originalIntlLocale: typeof Intl.Locale;

  beforeEach(() => {
    // Reset to default
    Object.defineProperty(navigator, 'language', {
      writable: true,
      value: 'en-US',
    });

    // Store original and mock Intl.Locale to force fallback logic
    originalIntlLocale = global.Intl.Locale;
    (global.Intl as any).Locale = jest.fn().mockImplementation(() => {
      throw new Error('Force fallback');
    });
  });

  afterEach(() => {
    // Restore original Intl.Locale
    (global.Intl as any).Locale = originalIntlLocale;
  });

  it('should return SUNDAY for en-US locale', () => {
    Object.defineProperty(navigator, 'language', {
      writable: true,
      value: 'en-US',
    });
    expect(detectCalendarStartDay()).toBe('SUNDAY');
  });

  it('should return MONDAY for German locale', () => {
    Object.defineProperty(navigator, 'language', {
      writable: true,
      value: 'de-DE',
    });
    expect(detectCalendarStartDay()).toBe('MONDAY');
  });

  it('should return MONDAY for French locale', () => {
    Object.defineProperty(navigator, 'language', {
      writable: true,
      value: 'fr-FR',
    });
    expect(detectCalendarStartDay()).toBe('MONDAY');
  });

  it('should return MONDAY for British English', () => {
    Object.defineProperty(navigator, 'language', {
      writable: true,
      value: 'en-GB',
    });
    expect(detectCalendarStartDay()).toBe('MONDAY');
  });

  it('should return SATURDAY for Arabic locale', () => {
    Object.defineProperty(navigator, 'language', {
      writable: true,
      value: 'ar-SA',
    });
    expect(detectCalendarStartDay()).toBe('SATURDAY');
  });

  it('should return SATURDAY for Hebrew locale', () => {
    Object.defineProperty(navigator, 'language', {
      writable: true,
      value: 'he-IL',
    });
    expect(detectCalendarStartDay()).toBe('SATURDAY');
  });

  it('should return SUNDAY for unknown locale', () => {
    Object.defineProperty(navigator, 'language', {
      writable: true,
      value: 'xx-XX',
    });
    expect(detectCalendarStartDay()).toBe('SUNDAY');
  });

  it('should handle missing navigator.language', () => {
    Object.defineProperty(navigator, 'language', {
      writable: true,
      value: undefined,
    });
    expect(detectCalendarStartDay()).toBe('SUNDAY');
  });

  it('should handle Intl.Locale with weekInfo support', () => {
    // Temporarily restore original and mock with weekInfo
    (global.Intl as any).Locale = jest.fn().mockImplementation(() => ({
      weekInfo: { firstDay: 1 }, // Monday
    }));

    expect(detectCalendarStartDay()).toBe('MONDAY');
  });

  it('should handle Intl.Locale with Saturday firstDay', () => {
    // Temporarily restore original and mock with weekInfo
    (global.Intl as any).Locale = jest.fn().mockImplementation(() => ({
      weekInfo: { firstDay: 6 }, // Saturday
    }));

    expect(detectCalendarStartDay()).toBe('SATURDAY');
  });

  it('should handle Intl.Locale throwing error', () => {
    // This test uses the default mock that throws an error
    Object.defineProperty(navigator, 'language', {
      writable: true,
      value: 'de-DE',
    });

    expect(detectCalendarStartDay()).toBe('MONDAY');
  });
});
