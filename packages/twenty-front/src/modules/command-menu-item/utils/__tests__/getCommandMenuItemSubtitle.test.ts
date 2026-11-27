import { getCommandMenuItemSubtitle } from '@/command-menu-item/utils/getCommandMenuItemSubtitle';
import { EngineComponentKey } from '~/generated-metadata/graphql';

const buildNavigationItem = (path: string) => ({
  engineComponentKey: EngineComponentKey.NAVIGATION,
  payload: { __typename: 'PathCommandMenuItemPayload' as const, path },
});

describe('getCommandMenuItemSubtitle', () => {
  it('returns Settings for a settings sub-page Go to command', () => {
    expect(
      getCommandMenuItemSubtitle(buildNavigationItem('/settings/experience')),
    ).toBe('Settings');
  });

  it.each(['/settings/profile', '/people'])(
    'returns no subtitle for a Go to command pointing to %s',
    (path) => {
      expect(
        getCommandMenuItemSubtitle(buildNavigationItem(path)),
      ).toBeUndefined();
    },
  );

  it('returns no subtitle for a command that does not navigate', () => {
    expect(
      getCommandMenuItemSubtitle({
        engineComponentKey: EngineComponentKey.ADD_TO_FAVORITES,
        payload: null,
      }),
    ).toBeUndefined();
  });
});
