import { isTimeZoneSupported } from '@/localization/utils/isTimeZoneSupported';
import { normalizeTimeZone } from '@/localization/utils/normalizeTimeZone';

jest.mock('@/localization/utils/isTimeZoneSupported');

const mockIsTimeZoneSupported = jest.mocked(isTimeZoneSupported);

const originalDateTimeFormat = global.Intl.DateTimeFormat;

const mockDetectedTimeZone = (timeZone: string) => {
  // @ts-expect-error - Mocking for test
  global.Intl.DateTimeFormat = jest.fn().mockImplementation(() => ({
    resolvedOptions: () => ({ timeZone }),
  }));
};

describe('normalizeTimeZone', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDetectedTimeZone('America/New_York');
  });

  afterAll(() => {
    global.Intl.DateTimeFormat = originalDateTimeFormat;
  });

  it('should return a supported time zone unchanged', () => {
    mockIsTimeZoneSupported.mockReturnValue(true);

    expect(normalizeTimeZone('Europe/Paris')).toBe('Europe/Paris');
  });

  it('should remap a legacy alias to its canonical IANA zone on every engine', () => {
    mockIsTimeZoneSupported.mockReturnValue(true);

    expect(normalizeTimeZone('CET')).toBe('Europe/Paris');
    expect(normalizeTimeZone('MET')).toBe('Europe/Berlin');
    expect(normalizeTimeZone('WET')).toBe('Europe/Lisbon');
    expect(normalizeTimeZone('EET')).toBe('Europe/Bucharest');
  });

  it('should fall back to the detected time zone for an unsupported unknown zone', () => {
    mockIsTimeZoneSupported.mockImplementation(
      (timeZone) => timeZone === 'America/New_York',
    );

    expect(normalizeTimeZone('Mars/Olympus')).toBe('America/New_York');
  });

  it('should canonicalize the detected time zone when it is itself a legacy alias', () => {
    // Simulate WebKit detecting the host zone as `CET` while rejecting it.
    mockDetectedTimeZone('CET');
    mockIsTimeZoneSupported.mockImplementation(
      (timeZone) => timeZone !== 'CET' && timeZone !== 'Mars/Olympus',
    );

    expect(normalizeTimeZone('Mars/Olympus')).toBe('Europe/Paris');
  });

  it('should fall back to UTC when even the detected zone is unsupported', () => {
    mockIsTimeZoneSupported.mockReturnValue(false);

    expect(normalizeTimeZone('Mars/Olympus')).toBe('UTC');
  });
});
