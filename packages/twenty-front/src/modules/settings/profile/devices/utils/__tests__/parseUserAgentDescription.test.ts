import { parseUserAgentDescription } from '@/settings/profile/devices/utils/parseUserAgentDescription';

describe('parseUserAgentDescription', () => {
  it('should return Unknown device for missing user agents', () => {
    expect(parseUserAgentDescription(null)).toBe('Unknown device');
    expect(parseUserAgentDescription(undefined)).toBe('Unknown device');
    expect(parseUserAgentDescription('')).toBe('Unknown device');
  });

  it('should detect Chrome on macOS', () => {
    expect(
      parseUserAgentDescription(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      ),
    ).toBe('Chrome on macOS');
  });

  it('should detect Edge before Chrome', () => {
    expect(
      parseUserAgentDescription(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.0.0',
      ),
    ).toBe('Edge on Windows');
  });

  it('should detect Safari on iOS', () => {
    expect(
      parseUserAgentDescription(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
      ),
    ).toBe('Safari on iOS');
  });

  it('should detect Firefox on Linux', () => {
    expect(
      parseUserAgentDescription(
        'Mozilla/5.0 (X11; Linux x86_64; rv:127.0) Gecko/20100101 Firefox/127.0',
      ),
    ).toBe('Firefox on Linux');
  });

  it('should fall back to the browser alone when the platform is unknown', () => {
    expect(parseUserAgentDescription('SomeAgent Chrome/1.0')).toBe('Chrome');
  });
});
