import {
  makeDraft,
  makeTab,
  makeWidget,
} from '@/page-layout/testing/pageLayoutDraftFixtures';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { SIDE_PANEL_FOCUS_ID } from '@/side-panel/constants/SidePanelFocusId';
import { SIDE_PANEL_SELECTABLE_LIST_ID } from '@/side-panel/constants/SidePanelSelectableListId';
import { PageLayoutSidePanelTargetProvider } from '@/side-panel/pages/page-layout/components/PageLayoutSidePanelTargetProvider';
import { RegularTabSettingsContent } from '@/side-panel/pages/page-layout/components/RegularTabSettingsContent';
import { SingleWidgetTabSettingsContent } from '@/side-panel/pages/page-layout/components/SingleWidgetTabSettingsContent';
import { WidgetSettingsManageSection } from '@/side-panel/pages/page-layout/components/WidgetSettingsManageSection';
import { WidgetSettingsPlacementSection } from '@/side-panel/pages/page-layout/components/WidgetSettingsPlacementSection';
import { EXPRESSION_DEVICE_DESKTOP } from '@/side-panel/pages/page-layout/constants/ExpressionDeviceDesktop';
import { WIDGET_SETTINGS_SELECTABLE_ITEM_IDS } from '@/side-panel/pages/page-layout/constants/settings/WidgetSettingsSelectableItemIds';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';

const WIDGET_SETTINGS_STORY_LAYOUT_ID = 'widget-placement-story';
const WIDGET_SETTINGS_STORY_WIDGET_ID = 'placement-widget';
const WIDGET_SETTINGS_STORY_SOURCE_TAB_ID = 'source-tab';
const WIDGET_SETTINGS_STORY_DESTINATION_TAB_ID = 'destination-tab';

const meta: Meta<typeof RegularTabSettingsContent> = {
  title: 'Modules/SidePanel/PageLayout/TabSettingsPlacementSection',
  component: RegularTabSettingsContent,
  decorators: [ComponentDecorator, MemoryRouterDecorator, ToastDecorator],
  args: {
    canSetAsPinned: true,
    canUnpin: false,
    canMoveLeft: true,
    canMoveRight: true,
    canDelete: true,
    isResetToDefaultDisabled: false,
    onSetAsPinned: fn(),
    onUnpin: fn(),
    onMoveLeft: fn(),
    onMoveRight: fn(),
    onDuplicate: fn(),
    onResetToDefault: fn(),
    onDelete: fn(),
  },
  beforeEach: ({ parameters }) => {
    const draft = makeDraft([
      makeTab(WIDGET_SETTINGS_STORY_SOURCE_TAB_ID, [
        makeWidget(
          WIDGET_SETTINGS_STORY_WIDGET_ID,
          0,
          WIDGET_SETTINGS_STORY_SOURCE_TAB_ID,
        ),
      ]),
      ...(parameters.noOtherTabs
        ? []
        : [makeTab(WIDGET_SETTINGS_STORY_DESTINATION_TAB_ID, [], 1)]),
    ]);
    jotaiStore.set(
      pageLayoutDraftComponentState.atomFamily({
        instanceId: WIDGET_SETTINGS_STORY_LAYOUT_ID,
      }),
      { ...draft, id: WIDGET_SETTINGS_STORY_LAYOUT_ID },
    );
    jotaiStore.set(
      pageLayoutEditingWidgetIdComponentState.atomFamily({
        instanceId: WIDGET_SETTINGS_STORY_LAYOUT_ID,
      }),
      WIDGET_SETTINGS_STORY_WIDGET_ID,
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
};

export default meta;
type Story = StoryObj<typeof RegularTabSettingsContent>;

export const Regular: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Placement')).toBeVisible();
    expect(
      canvas
        .getAllByText(/^(Pin tab|Move left|Move right)$/)
        .map((item) => item.textContent),
    ).toEqual(['Pin tab', 'Move left', 'Move right']);

    await userEvent.click(canvas.getByText('Placement'));
    await userEvent.keyboard('{Enter}{ArrowDown}{Enter}{ArrowDown}{Enter}');

    expect(args.onSetAsPinned).toHaveBeenCalledTimes(1);
    expect(args.onMoveLeft).toHaveBeenCalledTimes(1);
    expect(args.onMoveRight).toHaveBeenCalledTimes(1);
  },
};

export const Pinned: Story = {
  args: {
    canSetAsPinned: false,
    canUnpin: true,
    canMoveLeft: false,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    expect(canvas.queryByText('Pin tab')).not.toBeInTheDocument();
    expect(canvas.queryByText('Move left')).not.toBeInTheDocument();

    await userEvent.click(await canvas.findByText('Unpin tab'));
    await userEvent.keyboard('{ArrowDown}{Enter}');

    expect(args.onUnpin).toHaveBeenCalledTimes(1);
    expect(args.onMoveRight).toHaveBeenCalledTimes(1);
  },
};

export const SingleWidget: Story = {
  render: (args) => (
    <SingleWidgetTabSettingsContent
      {...args}
      pageLayoutId="tab-settings-story"
      singleWidget={makeWidget('widget-id', 0)}
    />
  ),
  play: Regular.play,
};

export const PinnedSingleWidget: Story = {
  args: Pinned.args,
  render: SingleWidget.render,
  play: Pinned.play,
};

export const MoveWidgetToTab: Story = {
  render: () => (
    <PageLayoutSidePanelTargetProvider
      pageLayoutId={WIDGET_SETTINGS_STORY_LAYOUT_ID}
      targetRecordIdentifier={{
        id: 'placement-record',
        targetObjectNameSingular: 'company',
      }}
    >
      <SidePanelList
        selectableItemIds={[
          WIDGET_SETTINGS_SELECTABLE_ITEM_IDS.MOVE_TO_TAB,
          WIDGET_SETTINGS_SELECTABLE_ITEM_IDS.ADD_WIDGET_ABOVE,
        ]}
      >
        <WidgetSettingsPlacementSection
          pageLayoutId={WIDGET_SETTINGS_STORY_LAYOUT_ID}
          isPlacementSectionVisible
          pageLayoutEditingWidgetId={WIDGET_SETTINGS_STORY_WIDGET_ID}
          showAddWidgetBelow={false}
          showMoveDown={false}
          showMoveUp={false}
        />
      </SidePanelList>
    </PageLayoutSidePanelTargetProvider>
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const trigger = await body.findByRole('button', {
      name: 'Move to another tab',
    });
    trigger.focus();
    await userEvent.keyboard('{Enter}');
    const destination = await body.findByRole('menuitem', {
      name: WIDGET_SETTINGS_STORY_DESTINATION_TAB_ID,
    });
    expect(body.getByRole('menu')).toBeVisible();
    expect(
      jotaiStore.get(
        selectedItemIdComponentState.atomFamily({
          instanceId: SIDE_PANEL_SELECTABLE_LIST_ID,
        }),
      ),
    ).toBe(WIDGET_SETTINGS_SELECTABLE_ITEM_IDS.MOVE_TO_TAB);
    expect(
      body.queryByRole('menuitem', {
        name: WIDGET_SETTINGS_STORY_SOURCE_TAB_ID,
      }),
    ).not.toBeInTheDocument();
    await userEvent.click(destination);
    await waitFor(() => {
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(trigger).toHaveFocus();
    });
    const draft = jotaiStore.get(
      pageLayoutDraftComponentState.atomFamily({
        instanceId: WIDGET_SETTINGS_STORY_LAYOUT_ID,
      }),
    );
    expect(draft.tabs[0].widgets).toHaveLength(0);
    expect(draft.tabs[1].widgets).toEqual([
      expect.objectContaining({
        id: WIDGET_SETTINGS_STORY_WIDGET_ID,
        pageLayoutTabId: WIDGET_SETTINGS_STORY_DESTINATION_TAB_ID,
      }),
    ]);
  },
};

export const NoEligibleTabs: Story = {
  parameters: { noOtherTabs: true },
  render: MoveWidgetToTab.render,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const trigger = await body.findByRole('button', {
      name: 'Move to another tab',
    });
    await userEvent.click(trigger);
    expect(
      await body.findByRole('menuitem', { name: 'No available tabs' }),
    ).toBeDisabled();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const WidgetVisibility: Story = {
  render: () => (
    <PageLayoutSidePanelTargetProvider
      pageLayoutId={WIDGET_SETTINGS_STORY_LAYOUT_ID}
      targetRecordIdentifier={{
        id: 'placement-record',
        targetObjectNameSingular: 'company',
      }}
    >
      <SidePanelList
        selectableItemIds={[
          WIDGET_SETTINGS_SELECTABLE_ITEM_IDS.VISIBILITY_RESTRICTION,
          WIDGET_SETTINGS_SELECTABLE_ITEM_IDS.RESET_TO_DEFAULT,
          WIDGET_SETTINGS_SELECTABLE_ITEM_IDS.REPLACE_WIDGET,
          WIDGET_SETTINGS_SELECTABLE_ITEM_IDS.DELETE_WIDGET,
        ]}
      >
        <WidgetSettingsManageSection
          pageLayoutId={WIDGET_SETTINGS_STORY_LAYOUT_ID}
        />
      </SidePanelList>
    </PageLayoutSidePanelTargetProvider>
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const trigger = await body.findByRole('button', {
      name: /^Visibility Restriction/,
    });
    await userEvent.click(trigger);
    expect(
      await body.findByRole('option', { name: 'Any device' }),
    ).toHaveAttribute('aria-selected', 'true');
    await userEvent.click(body.getByRole('option', { name: 'Desktop' }));
    await waitFor(() => {
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(trigger).toHaveFocus();
    });
    expect(
      jotaiStore.get(
        pageLayoutDraftComponentState.atomFamily({
          instanceId: WIDGET_SETTINGS_STORY_LAYOUT_ID,
        }),
      ).tabs[0].widgets[0].conditionalAvailabilityExpression,
    ).toBe(EXPRESSION_DEVICE_DESKTOP);
    await userEvent.click(trigger);
    expect(
      await body.findByRole('option', { name: 'Desktop' }),
    ).toHaveAttribute('aria-selected', 'true');
    await userEvent.keyboard('{Escape}');
  },
};
