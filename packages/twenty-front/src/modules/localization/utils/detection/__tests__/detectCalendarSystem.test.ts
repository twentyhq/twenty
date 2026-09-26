import { detectCalendarSystem } from '@/localization/utils/detection/detectCalendarSystem';

describe('detectCalendarSystem', () => {
  const mockNavigatorLanguage = (language: string) =>
    jest.spyOn(navigator, 'language', 'get').mockReturnValue(language);

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return PERSIAN for a locale defaulting to the Persian calendar', () => {
    mockNavigatorLanguage('fa-IR');

    expect(detectCalendarSystem()).toBe('PERSIAN');
  });

  it('should return ISLAMIC for a locale using an Islamic calendar', () => {
    mockNavigatorLanguage('ar-SA-u-ca-islamic-umalqura');

    expect(detectCalendarSystem()).toBe('ISLAMIC');
  });

  it('should return GREGORIAN for a locale using the Gregorian calendar', () => {
    mockNavigatorLanguage('en-US');

    expect(detectCalendarSystem()).toBe('GREGORIAN');
  });

  it('should return GREGORIAN for a calendar Twenty does not support', () => {
    mockNavigatorLanguage('he-IL-u-ca-hebrew');

    expect(detectCalendarSystem()).toBe('GREGORIAN');
  });
});
