import { getNavigationMenuBuiltInSectionLabel } from '@/navigation-menu-item/common/utils/getNavigationMenuBuiltInSectionLabel';

describe('getNavigationMenuBuiltInSectionLabel', () => {
  it('uses the custom name when set', () => {
    expect(
      getNavigationMenuBuiltInSectionLabel({
        name: ' Team chats ',
        defaultLabel: 'Favorite chats',
      }),
    ).toBe('Team chats');
  });

  it.each([null, undefined, '', '   '])(
    'falls back to the default label for %p',
    (name) => {
      expect(
        getNavigationMenuBuiltInSectionLabel({
          name,
          defaultLabel: 'Favorite chats',
        }),
      ).toBe('Favorite chats');
    },
  );
});
