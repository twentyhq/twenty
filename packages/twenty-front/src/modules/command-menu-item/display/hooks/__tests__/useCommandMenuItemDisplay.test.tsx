import { useCommandMenuItemDisplay } from '@/command-menu-item/display/hooks/useCommandMenuItemDisplay';
import { type CommandMenuItemDefinition } from '@/command-menu-item/types/CommandMenuItemDefinition';
import { renderHook } from '@testing-library/react';
import { CommandMenuItemVariant } from '~/generated-metadata/graphql';

const mockUseCommandMenuItemClick = jest.fn();

jest.mock('@/command-menu-item/hooks/useCommandMenuItemClick', () => ({
  useCommandMenuItemClick: () => mockUseCommandMenuItemClick(),
}));

jest.mock('@/workspace/hooks/useIsFeatureEnabled', () => ({
  useIsFeatureEnabled: () => false,
}));

jest.mock('twenty-ui/icon', () => ({
  useIcons: () => ({ getIcon: () => () => null }),
}));

const buildItem = (variant: CommandMenuItemVariant) =>
  ({
    id: 'command-menu-item-id',
    label: 'Generate meeting link',
    variant,
  }) as CommandMenuItemDefinition;

describe('useCommandMenuItemDisplay', () => {
  beforeEach(() => {
    mockUseCommandMenuItemClick.mockReturnValue({
      handleClick: jest.fn(),
      disabled: false,
      progress: undefined,
      showDisabledLoader: false,
    });
  });

  it('disables an item whose variant is DISABLED', () => {
    const { result } = renderHook(() =>
      useCommandMenuItemDisplay(buildItem(CommandMenuItemVariant.DISABLED)),
    );

    expect(result.current.disabled).toBe(true);
  });

  it.each([CommandMenuItemVariant.PRIMARY, CommandMenuItemVariant.SECONDARY])(
    'keeps a %s item enabled',
    (variant) => {
      const { result } = renderHook(() =>
        useCommandMenuItemDisplay(buildItem(variant)),
      );

      expect(result.current.disabled).toBe(false);
    },
  );

  it('keeps an item disabled while its click is running, whatever the variant', () => {
    mockUseCommandMenuItemClick.mockReturnValue({
      handleClick: jest.fn(),
      disabled: true,
      progress: undefined,
      showDisabledLoader: true,
    });

    const { result } = renderHook(() =>
      useCommandMenuItemDisplay(buildItem(CommandMenuItemVariant.PRIMARY)),
    );

    expect(result.current.disabled).toBe(true);
  });
});
