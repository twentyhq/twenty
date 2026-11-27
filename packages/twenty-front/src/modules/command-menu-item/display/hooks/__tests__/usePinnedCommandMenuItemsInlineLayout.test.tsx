import { renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { usePinnedCommandMenuItemsInlineLayout } from '@/command-menu-item/display/hooks/usePinnedCommandMenuItemsInlineLayout';
import { commandMenuPinnedInlineLayoutFamilyState } from '@/command-menu-item/display/states/commandMenuPinnedInlineLayoutFamilyState';
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
  __typename: 'CommandMenuItem',
  universalIdentifier: null,
  applicationId: null,
  coreWorkflowVersionId: null,
  workflowVersionId: null,
  frontComponentId: null,
  icon: null,
  shortLabel: null,
  conditionalAvailabilityExpression: null,
  conditionalPinnedExpression: null,
  availabilityObjectMetadataId: null,
  availabilityCoreObjectName: null,
  navigationTargetObjectMetadataId: null,
  pageLayoutId: null,
  frontComponent: null,
  payload: null,
});

const SNOOZE = buildPinnedCommandMenuItem({ id: 'snooze', hotKeys: ['H'] });
const DONE = buildPinnedCommandMenuItem({ id: 'done', hotKeys: ['E'] });

const ITEM_WIDTHS = { snooze: 100, done: 90 };

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

  it('shows every button that fits', () => {
    const layout = renderLayout(200);

    expect(layout.pinnedInlineCommandMenuItems).toEqual([SNOOZE, DONE]);
    expect(layout.pinnedOverflowCommandMenuItems).toEqual([]);
  });

  it('moves the buttons that do not fit to the overflow', () => {
    const layout = renderLayout(120);

    expect(layout.pinnedInlineCommandMenuItems).toEqual([SNOOZE]);
    expect(layout.pinnedOverflowCommandMenuItems).toEqual([DONE]);
  });
});
