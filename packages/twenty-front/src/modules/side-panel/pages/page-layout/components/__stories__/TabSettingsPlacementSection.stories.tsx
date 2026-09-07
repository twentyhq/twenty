import { makeWidget } from '@/page-layout/testing/pageLayoutDraftFixtures';
import { SIDE_PANEL_FOCUS_ID } from '@/side-panel/constants/SidePanelFocusId';
import { RegularTabSettingsContent } from '@/side-panel/pages/page-layout/components/RegularTabSettingsContent';
import { SingleWidgetTabSettingsContent } from '@/side-panel/pages/page-layout/components/SingleWidgetTabSettingsContent';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';

const meta: Meta<typeof RegularTabSettingsContent> = {
  title: 'Modules/SidePanel/PageLayout/TabSettingsPlacementSection',
  component: RegularTabSettingsContent,
  decorators: [ComponentDecorator, MemoryRouterDecorator],
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
  beforeEach: () => {
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
