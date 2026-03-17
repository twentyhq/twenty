import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { useIsCommandBlockedByGlobalLayoutCustomization } from '@/command-menu-item/hooks/useIsCommandBlockedByGlobalLayoutCustomization';
import { type CommandMenuItemConfig } from '@/command-menu-item/types/CommandMenuItemConfig';
import { CommandMenuItemScope } from '@/command-menu-item/types/CommandMenuItemScope';
import { CommandMenuItemType } from '@/command-menu-item/types/CommandMenuItemType';
import { renderHook } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { CommandMenuItemViewType } from 'twenty-shared/types';
import { Icon123 } from 'twenty-ui/display';

const getWrapper =
  (store = createStore()) =>
  ({ children }: { children: ReactNode }) => (
    <JotaiProvider store={store}>{children}</JotaiProvider>
  );

const buildCommandMenuItemConfig = (
  isAllowedDuringGlobalLayoutCustomization?: boolean,
): CommandMenuItemConfig => ({
  type: CommandMenuItemType.Standard,
  scope: CommandMenuItemScope.Global,
  key: 'test-command',
  label: 'Test Command',
  position: 1,
  Icon: Icon123,
  availableOn: [CommandMenuItemViewType.GLOBAL],
  shouldBeRegistered: () => true,
  component: null,
  isAllowedDuringGlobalLayoutCustomization,
});

describe('useIsCommandBlockedByGlobalLayoutCustomization', () => {
  it('should not block commands when global layout customization is inactive', () => {
    const store = createStore();
    const wrapper = getWrapper(store);
    const commandMenuItemConfig = buildCommandMenuItemConfig(false);

    store.set(isLayoutCustomizationModeEnabledState.atom, false);

    const { result } = renderHook(
      () =>
        useIsCommandBlockedByGlobalLayoutCustomization(commandMenuItemConfig),
      {
        wrapper,
      },
    );

    expect(result.current).toBe(false);
  });

  it('should block commands by default when global layout customization is active', () => {
    const store = createStore();
    const wrapper = getWrapper(store);
    const commandMenuItemConfig = buildCommandMenuItemConfig();

    store.set(isLayoutCustomizationModeEnabledState.atom, true);

    const { result } = renderHook(
      () =>
        useIsCommandBlockedByGlobalLayoutCustomization(commandMenuItemConfig),
      {
        wrapper,
      },
    );

    expect(result.current).toBe(true);
  });

  it('should allow commands explicitly marked for global layout customization', () => {
    const store = createStore();
    const wrapper = getWrapper(store);
    const commandMenuItemConfig = buildCommandMenuItemConfig(true);

    store.set(isLayoutCustomizationModeEnabledState.atom, true);

    const { result } = renderHook(
      () =>
        useIsCommandBlockedByGlobalLayoutCustomization(commandMenuItemConfig),
      {
        wrapper,
      },
    );

    expect(result.current).toBe(false);
  });
});
