import { parseUserAgentDescription } from '@/settings/profile/devices/utils/parseUserAgentDescription';

describe('parseUserAgentDescription', () => {
  it('should return nothing for missing user agents', () => {
    expect(parseUserAgentDescription(null)).toEqual({});
    expect(parseUserAgentDescription(undefined)).toEqual({});
    expect(parseUserAgentDescription('')).toEqual({});
  });

  it('should detect Chrome on macOS', () => {
    expect(
      parseUserAgentDescription(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      ),
    ).toEqual({ browser: 'Chrome', operatingSystem: 'macOS' });
  });

  it('should detect Edge before Chrome', () => {
    expect(
      parseUserAgentDescription(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.0.0',
      ),
    ).toEqual({ browser: 'Edge', operatingSystem: 'Windows' });
  });

  it('should detect Safari on iOS', () => {
    expect(
      parseUserAgentDescription(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
      ),
    ).toEqual({ browser: 'Safari', operatingSystem: 'iOS' });
  });

  it('should detect Firefox on Linux', () => {
    expect(
      parseUserAgentDescription(
        'Mozilla/5.0 (X11; Linux x86_64; rv:127.0) Gecko/20100101 Firefox/127.0',
      ),
    ).toEqual({ browser: 'Firefox', operatingSystem: 'Linux' });
  });

  it('should return the browser alone when the platform is unknown', () => {
    expect(parseUserAgentDescription('SomeAgent Chrome/1.0')).toEqual({
      browser: 'Chrome',
    });
  });
});
