import { getNavigationMenuTabLabel } from '@/navigation-menu-item/common/utils/getNavigationMenuTabLabel';

describe('getNavigationMenuTabLabel', () => {
  it('returns the tab name when it has one', () => {
    expect(
      getNavigationMenuTabLabel({ name: 'Sales', fallbackLabel: 'Tab' }),
    ).toBe('Sales');
  });

  it.each([null, undefined, ''])(
    'returns the fallback label when the name is %p',
    (name) => {
      expect(getNavigationMenuTabLabel({ name, fallbackLabel: 'Tab' })).toBe(
        'Tab',
      );
    },
  );
});
