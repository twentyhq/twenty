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

  it('should detect SPACES_AND_COMMA format for locales using regular space separator', () => {
    Object.defineProperty(navigator, 'language', {
      writable: true,
      value: 'nb-NO', // Norwegian uses space as thousand separator
    });
    expect(detectNumberFormat()).toBe('SPACES_AND_COMMA');
  });

  it('should detect SPACES_AND_COMMA format for locales using non-breaking space separator', () => {
    // Mock formatToParts to return non-breaking space
    const originalNumberFormat = Intl.NumberFormat;
    (global.Intl as any).NumberFormat = Object.assign(
      jest.fn().mockImplementation(() => ({
        formatToParts: () => [
          { type: 'integer', value: '1' },
          { type: 'group', value: '\u00A0' }, // non-breaking space
          { type: 'integer', value: '234' },
          { type: 'group', value: '\u00A0' },
          { type: 'integer', value: '567' },
          { type: 'decimal', value: ',' },
          { type: 'fraction', value: '89' },
        ],
      })),
      { supportedLocalesOf: jest.fn() },
    );

    expect(detectNumberFormat()).toBe('SPACES_AND_COMMA');
    global.Intl.NumberFormat = originalNumberFormat;
  });

  it('should detect SPACES_AND_COMMA format for locales using narrow no-break space separator', () => {
    // Mock formatToParts to return narrow no-break space
    const originalNumberFormat = Intl.NumberFormat;
    (global.Intl as any).NumberFormat = Object.assign(
      jest.fn().mockImplementation(() => ({
        formatToParts: () => [
          { type: 'integer', value: '1' },
          { type: 'group', value: '\u202F' }, // narrow no-break space
          { type: 'integer', value: '234' },
          { type: 'group', value: '\u202F' },
          { type: 'integer', value: '567' },
          { type: 'decimal', value: ',' },
          { type: 'fraction', value: '89' },
        ],
      })),
      { supportedLocalesOf: jest.fn() },
    );

    expect(detectNumberFormat()).toBe('SPACES_AND_COMMA');
    global.Intl.NumberFormat = originalNumberFormat;
  });

  it('should detect APOSTROPHE_AND_DOT format for locales using regular apostrophe separator', () => {
    // Mock formatToParts to return apostrophe
    const originalNumberFormat = Intl.NumberFormat;
    // @ts-expect-error - Mocking for test
    global.Intl.NumberFormat = jest.fn().mockImplementation(() => ({
      formatToParts: () => [
        { type: 'integer', value: '1' },
        { type: 'group', value: "'" }, // apostrophe
        { type: 'integer', value: '234' },
        { type: 'group', value: "'" },
        { type: 'integer', value: '567' },
        { type: 'decimal', value: '.' },
        { type: 'fraction', value: '89' },
      ],
    }));

    expect(detectNumberFormat()).toBe('APOSTROPHE_AND_DOT');
    global.Intl.NumberFormat = originalNumberFormat;
  });

  it('should detect APOSTROPHE_AND_DOT format for locales using right single quotation mark separator', () => {
    // Mock formatToParts to return right single quotation mark
    const originalNumberFormat = Intl.NumberFormat;
    // @ts-expect-error - Mocking for test
    global.Intl.NumberFormat = jest.fn().mockImplementation(() => ({
      formatToParts: () => [
        { type: 'integer', value: '1' },
        { type: 'group', value: '\u2019' }, // right single quotation mark
        { type: 'integer', value: '234' },
        { type: 'group', value: '\u2019' },
        { type: 'integer', value: '567' },
        { type: 'decimal', value: '.' },
        { type: 'fraction', value: '89' },
      ],
    }));

    expect(detectNumberFormat()).toBe('APOSTROPHE_AND_DOT');
    global.Intl.NumberFormat = originalNumberFormat;
  });

  it('should handle formatToParts throwing an error', () => {
    const originalNumberFormat = Intl.NumberFormat;
    // @ts-expect-error - Mocking for test
    global.Intl.NumberFormat = jest.fn().mockImplementation(() => ({
      formatToParts: () => {
        throw new Error('formatToParts failed');
      },
    }));

    expect(detectNumberFormat()).toBe('COMMAS_AND_DOT');
    global.Intl.NumberFormat = originalNumberFormat;
  });

  it('should handle Intl.NumberFormat constructor throwing an error', () => {
    const originalNumberFormat = Intl.NumberFormat;
    // @ts-expect-error - Mocking for test
    global.Intl.NumberFormat = jest.fn().mockImplementation(() => {
      throw new Error('NumberFormat constructor failed');
    });

    expect(detectNumberFormat()).toBe('COMMAS_AND_DOT');
    global.Intl.NumberFormat = originalNumberFormat;
  });

  it('should handle formatToParts returning parts without group or decimal types', () => {
    const originalNumberFormat = Intl.NumberFormat;
    // @ts-expect-error - Mocking for test
    global.Intl.NumberFormat = jest.fn().mockImplementation(() => ({
      formatToParts: () => [
        { type: 'integer', value: '1234567' },
        { type: 'fraction', value: '89' },
      ],
    }));

    expect(detectNumberFormat()).toBe('COMMAS_AND_DOT');
    global.Intl.NumberFormat = originalNumberFormat;
  });

  it('should handle unknown pattern combinations', () => {
    // Mock formatToParts to return an unknown pattern
    const originalNumberFormat = Intl.NumberFormat;
    // @ts-expect-error - Mocking for test
    global.Intl.NumberFormat = jest.fn().mockImplementation(() => ({
      formatToParts: () => [
        { type: 'integer', value: '1' },
        { type: 'group', value: '|' }, // unknown separator
        { type: 'integer', value: '234' },
        { type: 'decimal', value: ':' }, // unknown decimal
        { type: 'fraction', value: '89' },
      ],
    }));

    expect(detectNumberFormat()).toBe('COMMAS_AND_DOT');
    global.Intl.NumberFormat = originalNumberFormat;
  });
});
