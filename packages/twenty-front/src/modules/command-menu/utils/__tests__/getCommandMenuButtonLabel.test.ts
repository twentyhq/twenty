import { getCommandMenuButtonLabel } from '@/command-menu/utils/getCommandMenuButtonLabel';

describe('getCommandMenuButtonLabel', () => {
  it.each([
    { progress: undefined, expected: 'Preparing…' },
    { progress: 0, expected: 'Preparing…' },
    { progress: 42.6, expected: '43%' },
    { progress: 100, expected: '100%' },
  ])(
    'shows $expected while loading even when the label is hidden',
    ({ progress, expected }) => {
      expect(
        getCommandMenuButtonLabel({
          shortLabel: 'Export',
          isLoading: true,
          progress,
          shouldHideLabel: true,
        }),
      ).toBe(expected);
    },
  );

  it('hides the idle label even if progress remains', () => {
    expect(
      getCommandMenuButtonLabel({
        shortLabel: 'Export',
        isLoading: false,
        progress: 100,
        shouldHideLabel: true,
      }),
    ).toBeUndefined();
  });

  it.each(['Export', '', null, undefined])(
    'restores the idle label %s',
    (shortLabel) => {
      expect(
        getCommandMenuButtonLabel({
          shortLabel,
          isLoading: false,
          progress: 100,
          shouldHideLabel: false,
        }),
      ).toBe(shortLabel ?? undefined);
    },
  );
});
