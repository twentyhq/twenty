import { detectTimeZone } from '@/localization/utils/detection/detectTimeZone';
import { isTimeZoneSupported } from '@/localization/utils/isTimeZoneSupported';
import { normalizeTimeZone } from '@/localization/utils/normalizeTimeZone';

jest.mock('@/localization/utils/isTimeZoneSupported');
jest.mock('@/localization/utils/detection/detectTimeZone');

const mockIsTimeZoneSupported = jest.mocked(isTimeZoneSupported);
const mockDetectTimeZone = jest.mocked(detectTimeZone);

describe('normalizeTimeZone', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDetectTimeZone.mockReturnValue('America/New_York');
  });

  it('should return the time zone unchanged when the engine supports it', () => {
    mockIsTimeZoneSupported.mockReturnValue(true);

    expect(normalizeTimeZone('CET')).toBe('CET');
    expect(mockDetectTimeZone).not.toHaveBeenCalled();
  });

  it('should remap a legacy alias the engine rejects to its IANA equivalent', () => {
    // Simulate WebKit: `CET` unsupported, its canonical zone supported.
    mockIsTimeZoneSupported.mockImplementation(
      (timeZone) => timeZone !== 'CET',
    );

    expect(normalizeTimeZone('CET')).toBe('Europe/Paris');
    expect(mockDetectTimeZone).not.toHaveBeenCalled();
  });

  it('should fall back to the detected time zone for an unsupported unknown zone', () => {
    mockIsTimeZoneSupported.mockImplementation(
      (timeZone) => timeZone === 'America/New_York',
    );

    expect(normalizeTimeZone('Mars/Olympus')).toBe('America/New_York');
  });

  it('should fall back to UTC when even the detected zone is unsupported', () => {
    mockIsTimeZoneSupported.mockReturnValue(false);

    expect(normalizeTimeZone('Mars/Olympus')).toBe('UTC');
  });
});
