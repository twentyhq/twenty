import { useCancelLayoutCustomization } from '@/layout-customization/hooks/useCancelLayoutCustomization';
import { activeCustomizationPageLayoutIdsState } from '@/layout-customization/states/activeCustomizationPageLayoutIdsState';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { PageLayoutTabListEffect } from '@/page-layout/components/PageLayoutTabListEffect';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { pageLayoutTabSettingsOpenTabIdComponentState } from '@/page-layout/states/pageLayoutTabSettingsOpenTabIdComponentState';
import {
  makeDraft,
  makeTab,
  makeWidget,
} from '@/page-layout/testing/pageLayoutDraftFixtures';
import { getTabListInstanceIdFromPageLayoutAndRecord } from '@/page-layout/utils/getTabListInstanceIdFromPageLayoutAndRecord';
import { getIsFirstTabPinned } from '@/page-layout/utils/getIsFirstTabPinned';
import { getTabsByDisplayMode } from '@/page-layout/utils/getTabsByDisplayMode';
import { SIDE_PANEL_FOCUS_ID } from '@/side-panel/constants/SidePanelFocusId';
import { SidePanelPageLayoutTabSettingsContent } from '@/side-panel/pages/page-layout/components/SidePanelPageLayoutTabSettingsContent';
import { LayoutRenderingProvider } from '@/ui/layout/contexts/LayoutRenderingContext';
import { TabListFromUrlOptionalEffect } from '@/ui/layout/tab-list/components/TabListFromUrlOptionalEffect';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { TabListComponentInstanceContext } from '@/ui/layout/tab-list/states/contexts/TabListComponentInstanceContext';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { PageLayoutType } from '~/generated-metadata/graphql';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';

const PAGE_LAYOUT_ID = 'tab-settings-story';
const RECORD_ID = 'record-id';
const TAB_LIST_INSTANCE_ID = getTabListInstanceIdFromPageLayoutAndRecord({
  pageLayoutId: PAGE_LAYOUT_ID,
  layoutType: PageLayoutType.RECORD_PAGE,
  targetRecordIdentifier: {
    id: RECORD_ID,
    targetObjectNameSingular: 'company',
  },
});

const TabSelectionPreview = () => {
  const { hash } = useLocation();
  const { cancel } = useCancelLayoutCustomization();
  const isMobile = useIsMobile();
  const pageLayoutDraft = useAtomComponentStateValue(
    pageLayoutDraftComponentState,
    PAGE_LAYOUT_ID,
  );
  const activeTabId = useAtomComponentStateValue(activeTabIdComponentState);
  const { tabsToRenderInTabList, pinnedLeftTab } = getTabsByDisplayMode({
    tabs: pageLayoutDraft.tabs,
    pageLayoutType: pageLayoutDraft.type,
    isMobile,
    isInSidePanel: false,
    isFirstTabPinned: getIsFirstTabPinned(pageLayoutDraft),
  });

  return (
    <>
      <PageLayoutTabListEffect
        tabs={tabsToRenderInTabList}
        componentInstanceId={TAB_LIST_INSTANCE_ID}
      />
      <TabListFromUrlOptionalEffect
        tabListIds={tabsToRenderInTabList.map((tab) => tab.id)}
      />
      <output aria-label="Current tab URL">{hash}</output>
      <output aria-label="Active tab">{activeTabId}</output>
      <output aria-label="Pinned tab">{pinnedLeftTab?.title ?? 'none'}</output>
      <button onClick={cancel}>Cancel</button>
    </>
  );
};

const meta: Meta<typeof SidePanelPageLayoutTabSettingsContent> = {
  title: 'Modules/SidePanel/PageLayout/SidePanelPageLayoutTabSettingsContent',
  component: SidePanelPageLayoutTabSettingsContent,
  args: { pageLayoutId: PAGE_LAYOUT_ID, recordId: RECORD_ID },
  beforeEach: ({ parameters }) => {
    const pageLayoutDraft = {
      ...makeDraft([
        makeTab(
          'home',
          parameters.singleWidget ? [makeWidget('home-widget', 0, 'home')] : [],
          0,
        ),
        makeTab('timeline', [], 1),
      ]),
      id: PAGE_LAYOUT_ID,
    };

    jotaiStore.set(
      pageLayoutDraftComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_ID,
        surfaceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
      }),
      pageLayoutDraft,
    );
    jotaiStore.set(
      pageLayoutPersistedComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_ID,
        surfaceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
      }),
      {
        ...pageLayoutDraft,
        isFirstTabPinned: true,
        applicationId: '',
        universalIdentifier: PAGE_LAYOUT_ID,
        isSystemSideEffect: false,
        createdAt: '2026-08-01T00:00:00.000Z',
        updatedAt: '2026-08-01T00:00:00.000Z',
      },
    );
    jotaiStore.set(activeCustomizationPageLayoutIdsState.atom, [
      PAGE_LAYOUT_ID,
    ]);
    jotaiStore.set(isLayoutCustomizationModeEnabledState.atom, true);
    jotaiStore.set(
      activeTabIdComponentState.atomFamily({
        instanceId: TAB_LIST_INSTANCE_ID,
        surfaceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
      }),
      'timeline',
    );
    jotaiStore.set(
      pageLayoutTabSettingsOpenTabIdComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_ID,
        surfaceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
      }),
      'home',
    );
    jotaiStore.set(focusStackState.atom, [
      {
        focusId: SIDE_PANEL_FOCUS_ID,
        componentInstance: {
          componentType: FocusComponentType.SIDE_PANEL,
          componentInstanceId: SIDE_PANEL_FOCUS_ID,
        },
        globalHotkeysConfig: {
          enableGlobalHotkeysWithModifiers: true,
          enableGlobalHotkeysConflictingWithKeyboard: true,
        },
      },
    ]);
  },
  decorators: [
    SnackBarDecorator,
    (Story, { parameters }) => (
      <MemoryRouter
        initialEntries={[
          `/object/company/${RECORD_ID}${parameters.initialHash ?? ''}`,
        ]}
      >
        <LayoutRenderingProvider
          value={{
            layoutType: PageLayoutType.RECORD_PAGE,
            targetRecordIdentifier: {
              id: RECORD_ID,
              targetObjectNameSingular: 'company',
            },
          }}
        >
          <TabListComponentInstanceContext.Provider
            value={{ instanceId: TAB_LIST_INSTANCE_ID }}
          >
            <Story />
            <TabSelectionPreview />
          </TabListComponentInstanceContext.Provider>
        </LayoutRenderingProvider>
      </MemoryRouter>
    ),
  ],
  play: async ({ canvasElement, parameters }) => {
    const canvas = within(canvasElement);

    await userEvent.click(await canvas.findByText('Unpin tab'));

    expect(await canvas.findByText('Pin tab')).toBeVisible();

    expect(
      jotaiStore.get(
        pageLayoutDraftComponentState.atomFamily({
          instanceId: PAGE_LAYOUT_ID,
          surfaceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
        }),
      ).isFirstTabPinned,
    ).toBe(false);
    expect(
      jotaiStore.get(
        activeTabIdComponentState.atomFamily({
          instanceId: TAB_LIST_INSTANCE_ID,
          surfaceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
        }),
      ),
    ).toBe('home');
    expect(
      canvas.getByRole('status', { name: 'Current tab URL' }),
    ).toHaveTextContent('#home');

    if (parameters.cancelAfterUnpin) {
      await userEvent.click(canvas.getByRole('button', { name: 'Cancel' }));

      await waitFor(() => {
        expect(
          canvas.getByRole('status', { name: 'Pinned tab' }),
        ).toHaveTextContent('home');
        expect(
          canvas.getByRole('status', { name: 'Active tab' }),
        ).toHaveTextContent('timeline');
        expect(
          canvas.getByRole('status', { name: 'Current tab URL' }),
        ).toHaveTextContent('#timeline');
      });
      expect(jotaiStore.get(isLayoutCustomizationModeEnabledState.atom)).toBe(
        false,
      );
    }
  },
};

export default meta;
type Story = StoryObj<typeof SidePanelPageLayoutTabSettingsContent>;

export const Regular: Story = {};

export const RegularWithPreviousTabHash: Story = {
  parameters: { initialHash: '#timeline' },
};

export const SingleWidget: Story = {
  parameters: { singleWidget: true },
};

export const SingleWidgetWithPreviousTabHash: Story = {
  parameters: { singleWidget: true, initialHash: '#timeline' },
};

export const RegularUnpinThenCancel: Story = {
  parameters: { cancelAfterUnpin: true, initialHash: '#timeline' },
};

export const SingleWidgetUnpinThenCancel: Story = {
  parameters: {
    singleWidget: true,
    cancelAfterUnpin: true,
    initialHash: '#timeline',
  },
};
