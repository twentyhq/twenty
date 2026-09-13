import { getNavigationDrawerHomeDestination } from '@/navigation/utils/getNavigationDrawerHomeDestination';

const defaultHomePagePath = '/objects/companies';

describe('getNavigationDrawerHomeDestination', () => {
  it('returns the memorized url when it points at the app', () => {
    expect(
      getNavigationDrawerHomeDestination({
        memorizedUrl: '/objects/people?viewId=42',
        defaultHomePagePath,
      }),
    ).toBe('/objects/people?viewId=42');
  });

  it('falls back to the default home page when the memorized url is settings', () => {
    expect(
      getNavigationDrawerHomeDestination({
        memorizedUrl: '/settings/profile',
        defaultHomePagePath,
      }),
    ).toBe(defaultHomePagePath);
  });

  it('falls back to the default home page when the memorized url is the AI chat', () => {
    expect(
      getNavigationDrawerHomeDestination({
        memorizedUrl: '/chat/20202020-0687-4c41-b707-ed1bfca972a7',
        defaultHomePagePath,
      }),
    ).toBe(defaultHomePagePath);
  });

  it('falls back to the default home page when the memorized url is the inbox', () => {
    expect(
      getNavigationDrawerHomeDestination({
        memorizedUrl: '/inbox/open',
        defaultHomePagePath,
      }),
    ).toBe(defaultHomePagePath);
  });

  it.each([null, undefined, ''])(
    'falls back to the default home page when the memorized url is %p',
    (memorizedUrl) => {
      expect(
        getNavigationDrawerHomeDestination({
          memorizedUrl,
          defaultHomePagePath,
        }),
      ).toBe(defaultHomePagePath);
    },
  );
});
