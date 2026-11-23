import { getOriginFaviconUrl } from '@/settings/security/utils/getOriginFaviconUrl';

describe('getOriginFaviconUrl', () => {
  it('looks up the favicon of a public website', () => {
    expect(
      getOriginFaviconUrl({
        origin: 'https://meet.example.com',
        allowRequestsToTwentyIcons: true,
      }),
    ).toBe('https://twenty-icons.com/meet.example.com');
  });

  it('drops the port from the looked up domain', () => {
    expect(
      getOriginFaviconUrl({
        origin: 'https://meet.example.com:8443',
        allowRequestsToTwentyIcons: true,
      }),
    ).toBe('https://twenty-icons.com/meet.example.com');
  });

  it.each([
    'https://portal.corp.lan',
    'https://nas.home.arpa',
    'https://intranet',
    'http://localhost:3000',
    'http://192.168.1.10',
  ])('keeps the private host %s off twenty-icons', (origin) => {
    expect(
      getOriginFaviconUrl({ origin, allowRequestsToTwentyIcons: true }),
    ).toBeUndefined();
  });

  it('skips every lookup when the instance turns twenty-icons off', () => {
    expect(
      getOriginFaviconUrl({
        origin: 'https://meet.example.com',
        allowRequestsToTwentyIcons: false,
      }),
    ).toBeUndefined();
  });
});
