import { LayoutCustomizationBar } from '@/layout-customization/components/LayoutCustomizationBar';
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
import { getIsFirstTabPinned } from '@/page-layout/utils/getIsFirstTabPinned';
import { getTabListInstanceIdFromPageLayoutAndRecord } from '@/page-layout/utils/getTabListInstanceIdFromPageLayoutAndRecord';
import { getTabsByDisplayMode } from '@/page-layout/utils/getTabsByDisplayMode';
import { SidePanelSubPageRouter } from '@/side-panel/components/SidePanelSubPageRouter';
import { SIDE_PANEL_FOCUS_ID } from '@/side-panel/constants/SidePanelFocusId';
import { SIDE_PANEL_SELECTABLE_LIST_ID } from '@/side-panel/constants/SidePanelSelectableListId';
import { SidePanelPageLayoutTabSettingsContent } from '@/side-panel/pages/page-layout/components/SidePanelPageLayoutTabSettingsContent';
import { CONDITIONAL_AVAILABILITY_DEVICE_MOBILE } from '@/side-panel/pages/page-layout/constants/ConditionalAvailabilityDeviceMobile';
import { TAB_SETTINGS_SELECTABLE_ITEM_IDS } from '@/side-panel/pages/page-layout/constants/settings/TabSettingsSelectableItemIds';
import { PageLayoutSidePanelTargetContext } from '@/side-panel/pages/page-layout/contexts/PageLayoutSidePanelTargetContext';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { LayoutRenderingProvider } from '@/ui/layout/contexts/LayoutRenderingContext';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { TabListComponentInstanceContext } from '@/ui/layout/tab-list/states/contexts/TabListComponentInstanceContext';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useIsMobile } from 'twenty-ui/utilities';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { SidePanelPages } from 'twenty-shared/types';
import { IconAppWindow } from 'twenty-ui/icon';
import { PageLayoutType } from '~/generated-metadata/graphql';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';

const PAGE_LAYOUT_ID = 'tab-settings-story';
const RECORD_ID = 'record-id';
const PAGE_LAYOUT_SIDE_PANEL_TARGET = {
  pageLayoutId: PAGE_LAYOUT_ID,
  targetRecordIdentifier: {
    id: RECORD_ID,
    targetObjectNameSingular: 'company',
  },
};
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
  const isInEditMode = useAtomStateValue(isLayoutCustomizationModeEnabledState);
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
        isInEditMode={isInEditMode}
        tabs={tabsToRenderInTabList}
        componentInstanceId={TAB_LIST_INSTANCE_ID}
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
          parameters.singleWidget
            ? [
                {
                  ...makeWidget('home-widget', 0, 'home'),
                  conditionalAvailability:
                    parameters.widgetConditionalAvailability ?? null,
                },
              ]
            : [],
          0,
        ),
        makeTab('timeline', [], 1),
      ]),
      id: PAGE_LAYOUT_ID,
    };

    jotaiStore.set(
      pageLayoutDraftComponentState.atomFamily({ instanceId: PAGE_LAYOUT_ID }),
      pageLayoutDraft,
    );
    jotaiStore.set(
      pageLayoutPersistedComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_ID,
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
      }),
      'timeline',
    );
    jotaiStore.set(
      pageLayoutTabSettingsOpenTabIdComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_ID,
      }),
      'home',
    );
    jotaiStore.set(sidePanelNavigationStackState.atom, [
      {
        page: SidePanelPages.PageLayoutTabSettings,
        pageTitle: 'Tab settings',
        pageIcon: IconAppWindow,
        pageId: PAGE_LAYOUT_ID,
        pageLayoutSidePanelTarget: PAGE_LAYOUT_SIDE_PANEL_TARGET,
      },
    ]);
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
            {parameters.withLayoutCustomizationBar === true && (
              <LayoutCustomizationBar />
            )}
            <SidePanelPageComponentInstanceContext.Provider
              value={{ instanceId: PAGE_LAYOUT_ID }}
            >
              <PageLayoutSidePanelTargetContext.Provider
                value={PAGE_LAYOUT_SIDE_PANEL_TARGET}
              >
                <SidePanelSubPageRouter>
                  <Story />
                </SidePanelSubPageRouter>
              </PageLayoutSidePanelTargetContext.Provider>
            </SidePanelPageComponentInstanceContext.Provider>
            <TabSelectionPreview />
          </TabListComponentInstanceContext.Provider>
        </LayoutRenderingProvider>
      </MemoryRouter>
    ),
    ToastDecorator,
  ],
  play: async ({ canvasElement, parameters }) => {
    const canvas = within(canvasElement);

    await userEvent.click(await canvas.findByText('Unpin tab'));

    expect(await canvas.findByText('Pin tab')).toBeVisible();

    expect(
      jotaiStore.get(
        pageLayoutDraftComponentState.atomFamily({
          instanceId: PAGE_LAYOUT_ID,
        }),
      ).isFirstTabPinned,
    ).toBe(false);
    expect(
      jotaiStore.get(
        activeTabIdComponentState.atomFamily({
          instanceId: TAB_LIST_INSTANCE_ID,
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

export const SingleWidgetVisibility: Story = {
  parameters: {
    singleWidget: true,
    widgetConditionalAvailability: CONDITIONAL_AVAILABILITY_DEVICE_MOBILE,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const visibilityItem = await canvas.findByRole('button', {
      name: /^Visibility/,
    });

    expect(visibilityItem).toHaveTextContent('Custom rule');

    visibilityItem.focus();
    await userEvent.keyboard('{Enter}');

    expect(await canvas.findByText('Device')).toBeVisible();
    expect(canvas.getByText('Mobile')).toBeVisible();
    expect(
      jotaiStore.get(
        selectedItemIdComponentState.atomFamily({
          instanceId: SIDE_PANEL_SELECTABLE_LIST_ID,
        }),
      ),
    ).toBe(TAB_SETTINGS_SELECTABLE_ITEM_IDS.VISIBILITY_RESTRICTION);
  },
};

export const SingleWidgetIncompleteRuleBlocksSave: Story = {
  parameters: { singleWidget: true, withLayoutCustomizationBar: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(await canvas.findByText('Unpin tab'));
    expect(await canvas.findByRole('button', { name: 'Save' })).toBeEnabled();

    await userEvent.click(
      await canvas.findByRole('button', { name: /^Visibility/ }),
    );
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Everyone' }),
    );
    await userEvent.click(
      await body.findByRole('option', { name: 'Custom rule' }),
    );
    expect(await canvas.findByText('Select a value')).toBeVisible();

    await userEvent.click(canvas.getByRole('button', { name: 'Go back' }));

    expect(await canvas.findByText('Incomplete rule')).toBeVisible();
    expect(
      canvas.getByText('Finish or clear the visibility rule to save'),
    ).toBeVisible();
    expect(canvas.getByRole('button', { name: 'Save' })).toBeDisabled();
  },
};
