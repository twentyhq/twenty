import { renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { usePinnedCommandMenuItemsInlineLayout } from '@/command-menu-item/display/hooks/usePinnedCommandMenuItemsInlineLayout';
import { commandMenuPinnedInlineLayoutFamilyState } from '@/command-menu-item/display/states/commandMenuPinnedInlineLayoutFamilyState';
import { getPinnedCommandMenuItemWidthKey } from '@/command-menu-item/display/utils/getPinnedCommandMenuItemWidthKey';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import {
  CommandMenuItemAvailabilityType,
  type CommandMenuItemFieldsFragment,
  EngineComponentKey,
} from '~/generated-metadata/graphql';

const buildPinnedCommandMenuItem = ({
  id,
  hotKeys,
}: Pick<
  CommandMenuItemFieldsFragment,
  'id' | 'hotKeys'
>): CommandMenuItemFieldsFragment => ({
  id,
  hotKeys,
  label: id,
  position: 0,
  isPinned: true,
  isActive: true,
  engineComponentKey: EngineComponentKey.SNOOZE_AI_CHAT,
  availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
});

const SNOOZE = buildPinnedCommandMenuItem({ id: 'snooze', hotKeys: ['H'] });
const DONE = buildPinnedCommandMenuItem({ id: 'done', hotKeys: ['E'] });

const ITEM_WIDTHS = {
  [getPinnedCommandMenuItemWidthKey({
    commandMenuItemId: 'snooze',
    shouldShowHotKey: true,
  })]: 100,
  [getPinnedCommandMenuItemWidthKey({
    commandMenuItemId: 'snooze',
    shouldShowHotKey: false,
  })]: 80,
  [getPinnedCommandMenuItemWidthKey({
    commandMenuItemId: 'done',
    shouldShowHotKey: true,
  })]: 90,
  [getPinnedCommandMenuItemWidthKey({
    commandMenuItemId: 'done',
    shouldShowHotKey: false,
  })]: 70,
};

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
);

const renderLayout = (containerWidth: number) => {
  jotaiStore.set(
    commandMenuPinnedInlineLayoutFamilyState.atomFamily('page-header'),
    { containerWidth, commandMenuItemWidthsByKey: ITEM_WIDTHS },
  );

  return renderHook(
    () =>
      usePinnedCommandMenuItemsInlineLayout({
        pinnedCommandMenuItems: [SNOOZE, DONE],
        layoutKey: 'page-header',
      }),
    { wrapper: Wrapper },
  ).result.current;
};

describe('usePinnedCommandMenuItemsInlineLayout', () => {
  beforeEach(() => {
    resetJotaiStore();
  });

  it('shows hot keys when every button fits with them', () => {
    const layout = renderLayout(200);

    expect(layout.shouldShowHotKeys).toBe(true);
    expect(layout.pinnedInlineCommandMenuItems).toEqual([SNOOZE, DONE]);
  });

  it('drops the hot keys before dropping a button', () => {
    const layout = renderLayout(160);

    expect(layout.shouldShowHotKeys).toBe(false);
    expect(layout.pinnedInlineCommandMenuItems).toEqual([SNOOZE, DONE]);
    expect(layout.pinnedOverflowCommandMenuItems).toEqual([]);
  });

  it('keeps the hot keys when dropping them would not save a button', () => {
    const layout = renderLayout(120);

    expect(layout.shouldShowHotKeys).toBe(true);
    expect(layout.pinnedInlineCommandMenuItems).toEqual([SNOOZE]);
    expect(layout.pinnedOverflowCommandMenuItems).toEqual([DONE]);
  });
});
