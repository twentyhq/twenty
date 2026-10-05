import { TabListRoot } from '@/ui/layout/tab-list/components/TabListRoot';
import { Tabs } from 'twenty-ui/primitives/navigation';
import { Text } from 'twenty-ui/primitives/typography';
import { styled } from '@linaria/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { type ComponentProps, useMemo } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { isPageLayoutTabDraggingComponentState } from '@/page-layout/states/isPageLayoutTabDraggingComponentState';
import { usePageLayoutAddTabStrategy } from '@/page-layout/hooks/usePageLayoutAddTabStrategy';
import { pageLayoutTabSettingsOpenTabIdComponentState } from '@/page-layout/states/pageLayoutTabSettingsOpenTabIdComponentState';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { sidePanelPageInfoSelector } from '@/side-panel/states/sidePanelPageInfoSelector';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { SidePanelPageLayoutInfoContent } from '@/side-panel/components/SidePanelPageLayoutInfoContent';
import { TabListComponentInstanceContext } from '@/ui/layout/tab-list/states/contexts/TabListComponentInstanceContext';
import { SidePanelPages } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { PageLayoutTabList } from '@/page-layout/components/PageLayoutTabList';
import { PageLayoutTabListEffect } from '@/page-layout/components/PageLayoutTabListEffect';
import { PageLayoutWidgetDndProvider } from '@/page-layout/components/dnd/PageLayoutWidgetDndProvider';
import { PAGE_LAYOUT_RECORD_IDENTIFIER_BAR_HEIGHT } from '@/page-layout/constants/PageLayoutRecordIdentifierBarHeight';
import { PageLayoutEditModeProviderContext } from '@/page-layout/contexts/PageLayoutEditModeContext';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { LayoutRenderingProvider } from '@/ui/layout/contexts/LayoutRenderingContext';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { themeCssVariables } from 'twenty-ui/theme';
import { PageLayoutType } from '~/generated-metadata/graphql';
import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';

const StyledContainer = styled.div<{ containerWidth: number }>`
  border: 1px solid ${themeCssVariables.border.color.strong};
  padding: ${themeCssVariables.spacing[4]};
  width: ${({ containerWidth }) => containerWidth}px;
`;

const StyledTabListContainer = styled.div<{ isInIdentifierBar: boolean }>`
  box-shadow: ${({ isInIdentifierBar }) =>
    isInIdentifierBar
      ? `inset 0 -1px 0 ${themeCssVariables.border.color.light}`
      : 'none'};
  display: ${({ isInIdentifierBar }) => (isInIdentifierBar ? 'flex' : 'block')};
  height: ${({ isInIdentifierBar }) =>
    isInIdentifierBar
      ? `${PAGE_LAYOUT_RECORD_IDENTIFIER_BAR_HEIGHT}px`
      : 'auto'};
`;

const createInitialTabs = (): PageLayoutTab[] => [
  {
    isSystemSideEffect: false,
    universalIdentifier: 'universal-identifier-mock',
    __typename: 'PageLayoutTab',
    isActive: true,
    applicationId: '',
    id: 'overview',
    title: 'Overview',
    position: 0,
    icon: 'IconPlus',
    pageLayoutId: 'test-layout',
    widgets: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  },
  {
    isSystemSideEffect: false,
    universalIdentifier: 'universal-identifier-mock',
    __typename: 'PageLayoutTab',
    isActive: true,
    applicationId: '',
    id: 'revenue',
    title: 'Revenue',
    position: 1,
    pageLayoutId: 'test-layout',
    widgets: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  },
  {
    isSystemSideEffect: false,
    universalIdentifier: 'universal-identifier-mock',
    __typename: 'PageLayoutTab',
    isActive: true,
    applicationId: '',
    id: 'forecasts',
    title: 'Forecasts',
    position: 2,
    pageLayoutId: 'test-layout',
    widgets: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  },
];

type PageLayoutTabListPlaygroundProps = Pick<
  ComponentProps<typeof PageLayoutTabList>,
  'isReorderEnabled' | 'presentation' | 'centerTabs'
> & {
  containerWidth?: number;
  isInEditMode?: boolean;
  hasAddButton?: boolean;
  newTabMenu?: boolean;
};

const PageLayoutTabListPlayground = ({
  isReorderEnabled,
  presentation = 'standalone',
  centerTabs = false,
  containerWidth = 720,
  isInEditMode = false,
  hasAddButton = true,
  newTabMenu = false,
}: PageLayoutTabListPlaygroundProps) => {
  const isInIdentifierBar = presentation === 'identifier-bar';
  const [pageLayoutDraft, setPageLayoutDraft] = useAtomComponentState(
    pageLayoutDraftComponentState,
  );
  const sidePanelPageInfo = useAtomStateValue(sidePanelPageInfoSelector);

  const addTabStrategy = usePageLayoutAddTabStrategy({
    pageLayoutId: 'instance-id',
    tabListInstanceId: 'page-layout-tab-list-story',
  });
  const sortedTabs = useMemo(() => {
    return [...pageLayoutDraft.tabs]
      .filter((tab) => tab.isActive)
      .sort((first, second) => first.position - second.position);
  }, [pageLayoutDraft.tabs]);

  const handleAddTab = () => {
    setPageLayoutDraft((prev) => {
      const nextIndex = prev.tabs.length;

      return {
        ...prev,
        tabs: [
          ...prev.tabs,
          {
            __typename: 'PageLayoutTab',
            isActive: true,
            applicationId: '',
            isSystemSideEffect: false,
            universalIdentifier: 'universal-identifier-mock',
            id: `new-tab-${nextIndex}`,
            title: `New Tab ${nextIndex}`,
            position: nextIndex,
            pageLayoutId: 'test-layout',
            widgets: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            deletedAt: null,
          },
        ],
      };
    });
  };

  return (
    <StyledContainer containerWidth={containerWidth}>
      <PageLayoutTabListEffect
        isInEditMode={isInEditMode}
        tabs={sortedTabs}
        componentInstanceId="page-layout-tab-list-story"
      />

      <TabListRoot componentInstanceId="page-layout-tab-list-story">
        <PageLayoutWidgetDndProvider>
          <StyledTabListContainer isInIdentifierBar={isInIdentifierBar}>
            <PageLayoutTabList
              aria-label="Dashboard sections"
              tabs={sortedTabs}
              componentInstanceId="page-layout-tab-list-story"
              behaveAsLinks={false}
              loading={false}
              addTabStrategy={
                hasAddButton && isReorderEnabled
                  ? newTabMenu
                    ? addTabStrategy
                    : { mode: 'direct', onCreate: handleAddTab }
                  : undefined
              }
              isReorderEnabled={isReorderEnabled}
              pageLayoutType={
                isInIdentifierBar
                  ? PageLayoutType.RECORD_PAGE
                  : PageLayoutType.DASHBOARD
              }
              presentation={presentation}
              centerTabs={centerTabs}
            />
          </StyledTabListContainer>
        </PageLayoutWidgetDndProvider>
        {sortedTabs.map((tab) => (
          <Tabs.Panel key={tab.id} value={tab.id}>
            <Text>{tab.title} content</Text>
          </Tabs.Panel>
        ))}
      </TabListRoot>
      {newTabMenu &&
        sidePanelPageInfo.page === SidePanelPages.PageLayoutTabSettings && (
          <SidePanelPageComponentInstanceContext.Provider
            value={{ instanceId: sidePanelPageInfo.instanceId }}
          >
            <SidePanelPageLayoutInfoContent pageLayoutId="instance-id" />
          </SidePanelPageComponentInstanceContext.Provider>
        )}
    </StyledContainer>
  );
};

const meta: Meta<typeof PageLayoutTabListPlayground> = {
  title: 'Modules/PageLayout/PageLayoutTabList',
  component: PageLayoutTabListPlayground,
  args: {
    isReorderEnabled: true,
  },
  beforeEach: ({ args }) => {
    const initialTabs = createInitialTabs();
    const inactiveTab = { ...initialTabs[2], isActive: false };

    jotaiStore.set(
      pageLayoutDraftComponentState.atomFamily({ instanceId: 'instance-id' }),
      {
        id: 'instance-id',
        name: 'Tab layout',
        type:
          args.presentation === 'identifier-bar'
            ? PageLayoutType.RECORD_PAGE
            : PageLayoutType.DASHBOARD,
        tabs: args.newTabMenu
          ? [...initialTabs.slice(0, 2), inactiveTab]
          : initialTabs,
        objectMetadataId: null,
        defaultTabToFocusOnMobileAndSidePanelId: null,
        isFirstTabPinned: false,
      },
    );
    const draft = jotaiStore.get(
      pageLayoutDraftComponentState.atomFamily({ instanceId: 'instance-id' }),
    );
    jotaiStore.set(
      pageLayoutPersistedComponentState.atomFamily({
        instanceId: 'instance-id',
      }),
      {
        ...draft,
        applicationId: '',
        universalIdentifier: 'instance-id',
        isSystemSideEffect: false,
        createdAt: '2026-08-01T00:00:00.000Z',
        updatedAt: '2026-08-01T00:00:00.000Z',
      },
    );
    jotaiStore.set(
      activeTabIdComponentState.atomFamily({
        instanceId: 'page-layout-tab-list-story',
      }),
      'overview',
    );
    jotaiStore.set(
      pageLayoutTabSettingsOpenTabIdComponentState.atomFamily({
        instanceId: 'instance-id',
      }),
      null,
    );
    jotaiStore.set(sidePanelNavigationStackState.atom, []);
  },
  decorators: [
    ComponentWithRouterDecorator,
    (Story, { args }) => (
      <PageLayoutEditModeProviderContext
        value={{ isInEditMode: args.isInEditMode ?? false }}
      >
        <PageLayoutComponentInstanceContext.Provider
          value={{ instanceId: 'instance-id' }}
        >
          <LayoutRenderingProvider
            value={{
              layoutType:
                args.presentation === 'identifier-bar'
                  ? PageLayoutType.RECORD_PAGE
                  : PageLayoutType.DASHBOARD,
              targetRecordIdentifier: undefined,
            }}
          >
            <TabListComponentInstanceContext.Provider
              value={{ instanceId: 'page-layout-tab-list-story' }}
            >
              <Story />
            </TabListComponentInstanceContext.Provider>
          </LayoutRenderingProvider>
        </PageLayoutComponentInstanceContext.Provider>
      </PageLayoutEditModeProviderContext>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof PageLayoutTabListPlayground>;

export const Default: Story = {
  args: {
    isReorderEnabled: true,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const tabList = await canvas.findByRole('tablist');

    expect(getComputedStyle(tabList, '::after').display).toBe('none');
    expect(getComputedStyle(tabList.parentElement!, '::after').display).toBe(
      args.presentation === 'identifier-bar' ? 'none' : 'block',
    );
    expect(await canvas.findByRole('tab', { name: 'Overview' })).toBeVisible();
    expect(canvas.getByRole('tab', { name: 'Forecasts' })).toBeVisible();
    expect(
      canvas.queryByRole('button', { name: 'Overview' }),
    ).not.toBeInTheDocument();

    await userEvent.click(
      within(canvas.getByRole('tab', { name: 'Revenue' })).getByText('Revenue'),
    );

    await waitFor(() =>
      expect(
        jotaiStore.get(
          activeTabIdComponentState.atomFamily({
            instanceId: 'page-layout-tab-list-story',
          }),
        ),
      ).toBe('revenue'),
    );
  },
};

export const IdentifierBar: Story = {
  args: {
    presentation: 'identifier-bar',
    isReorderEnabled: false,
  },
  play: Default.play,
};

export const IdentifierBarCentered: Story = {
  args: {
    ...IdentifierBar.args,
    centerTabs: true,
  },
  play: Default.play,
};

export const IdentifierBarNarrow: Story = {
  args: {
    presentation: 'identifier-bar',
    containerWidth: 240,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    const [moreButton] = await canvas.findAllByRole('button', { name: /More/ });

    await userEvent.click(moreButton);
    await userEvent.click(await body.findByRole('button', { name: 'Revenue' }));
    await waitFor(() =>
      expect(
        jotaiStore.get(
          activeTabIdComponentState.atomFamily({
            instanceId: 'page-layout-tab-list-story',
          }),
        ),
      ).toBe('revenue'),
    );
    await waitFor(() =>
      expect(
        body.queryByRole('dialog', { name: /More/ }),
      ).not.toBeInTheDocument(),
    );
    await userEvent.click(moreButton);

    expect(
      await body.findByRole('button', { name: 'Revenue' }),
    ).toHaveAttribute('aria-pressed', 'true');

    await userEvent.click(body.getByRole('button', { name: 'Revenue' }));
    await userEvent.click(canvas.getByRole('button', { name: 'New Tab' }));
    await userEvent.click(moreButton);

    expect(
      await body.findByRole('button', { name: 'New Tab 3' }),
    ).toBeVisible();
  },
};

export const IdentifierBarCenteredNarrow: Story = {
  args: {
    ...IdentifierBarNarrow.args,
    centerTabs: true,
  },
  play: IdentifierBarNarrow.play,
};

export const KeyboardReorder: Story = {
  args: { isReorderEnabled: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const overview = await canvas.findByRole('tab', { name: 'Overview' });

    overview.focus();
    await userEvent.keyboard('[Space]');
    await userEvent.keyboard('{ArrowRight}');
    await userEvent.keyboard('[Space]');

    await waitFor(() => {
      const draft = jotaiStore.get(
        pageLayoutDraftComponentState.atomFamily({ instanceId: 'instance-id' }),
      );
      const orderedTitles = [...draft.tabs]
        .sort((first, second) => first.position - second.position)
        .map((tab) => tab.title);

      expect(orderedTitles).toEqual(['Revenue', 'Overview', 'Forecasts']);
    });
  },
};

export const OverflowKeyboardReorder: Story = {
  args: { containerWidth: 300, hasAddButton: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(await canvas.findByRole('button', { name: /More/ }));
    const revenue = await body.findByRole('button', { name: 'Revenue' });

    revenue.focus();
    await userEvent.keyboard('{Tab}');
    expect(
      body.getByRole('button', { name: 'Reorder Revenue tab' }),
    ).toHaveFocus();
    await userEvent.keyboard('[Space]');
    await waitFor(() =>
      expect(
        jotaiStore.get(
          isPageLayoutTabDraggingComponentState.atomFamily({
            instanceId: 'page-layout-tab-list-story',
          }),
        ),
      ).toBe(true),
    );
    await userEvent.keyboard('{ArrowDown}');
    await new Promise(requestAnimationFrame);
    await userEvent.keyboard('[Space]');

    await waitFor(() => {
      const draft = jotaiStore.get(
        pageLayoutDraftComponentState.atomFamily({ instanceId: 'instance-id' }),
      );
      expect(
        [...draft.tabs]
          .sort((first, second) => first.position - second.position)
          .map((tab) => tab.title),
      ).toEqual(['Overview', 'Forecasts', 'Revenue']);
    });
    await waitFor(() =>
      expect(
        jotaiStore.get(
          isPageLayoutTabDraggingComponentState.atomFamily({
            instanceId: 'page-layout-tab-list-story',
          }),
        ),
      ).toBe(false),
    );
    expect(body.getByRole('dialog', { name: /More/ })).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(
        body.queryByRole('dialog', { name: /More/ }),
      ).not.toBeInTheDocument(),
    );
  },
};

const dragTabToElement = async ({
  source,
  target,
  onDragStart,
}: {
  source: HTMLElement;
  target: HTMLElement;
  onDragStart?: () => void;
}) => {
  const user = userEvent.setup();
  const sourceBounds = source.getBoundingClientRect();
  const targetBounds = target.getBoundingClientRect();

  await user.pointer({
    keys: '[MouseLeft>]',
    target: source,
    coords: {
      clientX: sourceBounds.x + sourceBounds.width / 2,
      clientY: sourceBounds.y + sourceBounds.height / 2,
    },
  });
  await user.pointer({
    target: source,
    coords: {
      clientX: sourceBounds.x + sourceBounds.width / 2,
      clientY: sourceBounds.y + sourceBounds.height / 2 + 15,
    },
  });
  await waitFor(() =>
    expect(
      jotaiStore.get(
        isPageLayoutTabDraggingComponentState.atomFamily({
          instanceId: 'page-layout-tab-list-story',
        }),
      ),
    ).toBe(true),
  );
  onDragStart?.();
  await user.pointer({
    target,
    coords: {
      clientX: targetBounds.x + targetBounds.width / 2,
      clientY: targetBounds.bottom - 2,
    },
  });
  await new Promise(requestAnimationFrame);
  const releaseTarget = source.ownerDocument.elementFromPoint(
    targetBounds.x + targetBounds.width / 2,
    targetBounds.bottom - 2,
  );
  await user.pointer({
    keys: '[/MouseLeft]',
    target: releaseTarget ?? source.ownerDocument.body,
  });
};

export const OverflowPointerReorder: Story = {
  args: { containerWidth: 300, hasAddButton: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(await canvas.findByRole('button', { name: /More/ }));
    const revenue = await body.findByRole('button', { name: 'Revenue' });
    const forecasts = body.getByRole('button', { name: 'Forecasts' });
    await dragTabToElement({
      source: revenue,
      target: forecasts,
      onDragStart: () =>
        expect(body.getByRole('dialog', { name: /More/ })).toBeVisible(),
    });

    await waitFor(() => {
      const draft = jotaiStore.get(
        pageLayoutDraftComponentState.atomFamily({ instanceId: 'instance-id' }),
      );
      expect(
        [...draft.tabs]
          .sort((first, second) => first.position - second.position)
          .map((tab) => tab.title),
      ).toEqual(['Overview', 'Forecasts', 'Revenue']);
    });
    expect(body.getByRole('dialog', { name: /More/ })).toBeVisible();
  },
};

export const DragVisibleTabIntoOverflow: Story = {
  args: { containerWidth: 250, hasAddButton: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(await canvas.findByRole('button', { name: /More/ }));
    const overview = canvas.getByRole('tab', { name: 'Overview' });
    const forecasts = await body.findByRole('button', { name: 'Forecasts' });
    await dragTabToElement({
      source: overview,
      target: forecasts,
      onDragStart: () =>
        expect(body.getByRole('dialog', { name: /More/ })).toBeVisible(),
    });

    await waitFor(() => {
      const draft = jotaiStore.get(
        pageLayoutDraftComponentState.atomFamily({ instanceId: 'instance-id' }),
      );
      expect(
        [...draft.tabs]
          .sort((first, second) => first.position - second.position)
          .map((tab) => tab.title),
      ).toEqual(['Revenue', 'Forecasts', 'Overview']);
    });
    expect(body.getByRole('dialog', { name: /More/ })).toBeVisible();
  },
};

export const OverflowTabSettings: Story = {
  args: { containerWidth: 300, hasAddButton: false, isInEditMode: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(await canvas.findByRole('button', { name: /More/ }));
    const revenue = await body.findByRole('button', { name: 'Revenue' });
    const revenueRow = revenue.parentElement;
    if (!isDefined(revenueRow)) {
      throw new Error('Revenue tab row not found');
    }
    revenue.focus();
    await userEvent.hover(revenueRow);
    const editTabIcon = within(revenueRow).getByRole('button', {
      name: 'Edit tab icon',
    });
    expect(editTabIcon).toHaveAttribute('tabindex', '-1');
    expect(editTabIcon).toBeVisible();
    const user = userEvent.setup();
    const editIconBounds = editTabIcon.getBoundingClientRect();
    await user.pointer({
      keys: '[MouseLeft>]',
      target: editTabIcon,
      coords: {
        clientX: editIconBounds.x + editIconBounds.width / 2,
        clientY: editIconBounds.y + editIconBounds.height / 2,
      },
    });
    await user.pointer({
      target: editTabIcon,
      coords: {
        clientX: editIconBounds.x + editIconBounds.width / 2 + 10,
        clientY: editIconBounds.y + editIconBounds.height / 2,
      },
    });
    await new Promise(requestAnimationFrame);
    expect(
      jotaiStore.get(
        isPageLayoutTabDraggingComponentState.atomFamily({
          instanceId: 'page-layout-tab-list-story',
        }),
      ),
    ).toBe(false);
    await user.pointer({ keys: '[/MouseLeft]', target: editTabIcon });

    await waitFor(() =>
      expect(
        body.queryByRole('dialog', { name: /More/ }),
      ).not.toBeInTheDocument(),
    );
    expect(
      jotaiStore.get(
        pageLayoutTabSettingsOpenTabIdComponentState.atomFamily({
          instanceId: 'instance-id',
        }),
      ),
    ).toBe('revenue');
    expect(
      jotaiStore.get(sidePanelNavigationStackState.atom).at(-1)?.page,
    ).toBe(SidePanelPages.PageLayoutTabSettings);
  },
};

export const NewTabMenu: Story = {
  args: {
    presentation: 'identifier-bar',
    isInEditMode: true,
    newTabMenu: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      await canvas.findByRole('button', { name: 'New Tab' }),
    );
    await userEvent.click(
      await body.findByRole('menuitem', { name: 'Empty tab' }),
    );
    await waitFor(() =>
      expect(body.queryByRole('menu')).not.toBeInTheDocument(),
    );
    expect(await canvas.findByRole('tab', { name: 'Untitled' })).toBeVisible();
    const settingsPage = jotaiStore
      .get(sidePanelNavigationStackState.atom)
      .at(-1);
    expect(settingsPage?.page).toBe(SidePanelPages.PageLayoutTabSettings);
    const titleInput = await canvas.findByRole('textbox');
    expect(titleInput).toHaveValue('Untitled');
    await waitFor(() => expect(titleInput).toHaveFocus());
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(titleInput).not.toBeInTheDocument());

    await userEvent.click(canvas.getByRole('button', { name: 'New Tab' }));
    expect(await body.findByText('Disabled')).toBeVisible();
    await userEvent.click(body.getByRole('menuitem', { name: 'Forecasts' }));
    await waitFor(() =>
      expect(body.queryByRole('menu')).not.toBeInTheDocument(),
    );
    expect(
      await canvas.findByRole('tab', { name: 'Forecasts' }),
    ).toHaveAttribute('aria-selected', 'true');
    expect(
      jotaiStore.get(
        pageLayoutTabSettingsOpenTabIdComponentState.atomFamily({
          instanceId: 'instance-id',
        }),
      ),
    ).toBe('forecasts');
  },
};

export const DropOnMoreOpensOverflow: Story = {
  args: { containerWidth: 250, hasAddButton: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const moreButton = await canvas.findByRole('button', { name: /More/ });
    const overview = canvas.getByRole('tab', { name: 'Overview' });

    await dragTabToElement({ source: overview, target: moreButton });

    expect(await body.findByRole('dialog', { name: /More/ })).toBeVisible();
    expect(await body.findByRole('button', { name: 'Overview' })).toBeVisible();
  },
};
