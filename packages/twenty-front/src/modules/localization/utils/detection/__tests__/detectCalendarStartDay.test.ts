import { detectCalendarStartDay } from '@/localization/utils/detection/detectCalendarStartDay';

// Mock navigator.language
Object.defineProperty(navigator, 'language', {
  writable: true,
  value: 'en-US',
});

const originalIntlLocale = Intl.Locale;

const setMockLocale = ({
  weekInfo,
  shouldThrow = false,
}: {
  weekInfo?: { firstDay: number };
  shouldThrow?: boolean;
}) => {
  class MockLocale {
    weekInfo?: { firstDay: number };

    constructor() {
      if (shouldThrow) {
        throw new Error('Force fallback');
      }
      this.weekInfo = weekInfo;
    }
  }

  // @ts-expect-error - override Intl.Locale for test
  global.Intl.Locale = MockLocale;
};

describe('detectCalendarStartDay', () => {
  beforeEach(() => {
    // Reset to default
    Object.defineProperty(navigator, 'language', {
      writable: true,
      value: 'en-US',
    });

    // Store original and mock Intl.Locale to force fallback logic
    setMockLocale({ shouldThrow: true });
  });

  afterEach(() => {
    // Restore original Intl.Locale
    // @ts-expect-error - restore Intl.Locale after test
    global.Intl.Locale = originalIntlLocale;
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
    setMockLocale({ weekInfo: { firstDay: 1 } });

    expect(detectCalendarStartDay()).toBe('MONDAY');
  });

  it('should handle Intl.Locale with Saturday firstDay', () => {
    // Temporarily restore original and mock with weekInfo
    setMockLocale({ weekInfo: { firstDay: 6 } });

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
