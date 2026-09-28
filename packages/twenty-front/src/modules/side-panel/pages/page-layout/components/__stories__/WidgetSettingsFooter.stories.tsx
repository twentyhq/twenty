import { pageLayoutCurrentLayoutsComponentState } from '@/page-layout/states/pageLayoutCurrentLayoutsComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import {
  makeDraft,
  makeTab,
  makeWidget,
} from '@/page-layout/testing/pageLayoutDraftFixtures';
import { SIDE_PANEL_CLICK_OUTSIDE_ID } from '@/side-panel/constants/SidePanelClickOutsideId';
import { SIDE_PANEL_FOCUS_ID } from '@/side-panel/constants/SidePanelFocusId';
import { WidgetSettingsFooter } from '@/side-panel/pages/page-layout/components/WidgetSettingsFooter';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { ParentClickOutsideIdContext } from '@/ui/utilities/pointer-event/contexts/ParentClickOutsideIdContext';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { styled } from '@linaria/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { type ReactNode } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';

const PAGE_LAYOUT_ID = 'widget-settings-footer-story';
const WIDGET_ID = 'revenue';
const TAB_ID = 'overview';
const onBackgroundClickOutside = fn();

const StyledFooter = styled.div`
  margin-top: 100px;
  width: 320px;
`;

const BackgroundSelection = ({ children }: { children: ReactNode }) => {
  useListenClickOutside({
    listenerId: 'widget-footer-background',
    excludedClickOutsideIds: [SIDE_PANEL_CLICK_OUTSIDE_ID],
    refs: [],
    callback: onBackgroundClickOutside,
  });

  return (
    <ParentClickOutsideIdContext.Provider value={SIDE_PANEL_CLICK_OUTSIDE_ID}>
      <StyledFooter data-click-outside-id={SIDE_PANEL_CLICK_OUTSIDE_ID}>
        {children}
      </StyledFooter>
    </ParentClickOutsideIdContext.Provider>
  );
};

const meta: Meta<typeof WidgetSettingsFooter> = {
  title: 'Modules/SidePanel/PageLayout/WidgetSettingsFooter',
  component: WidgetSettingsFooter,
  decorators: [
    (Story) => (
      <BackgroundSelection>
        <Story />
      </BackgroundSelection>
    ),
    ComponentDecorator,
    MemoryRouterDecorator,
  ],
  args: { pageLayoutId: PAGE_LAYOUT_ID },
  beforeEach: () => {
    onBackgroundClickOutside.mockClear();
    jotaiStore.set(
      pageLayoutDraftComponentState.atomFamily({ instanceId: PAGE_LAYOUT_ID }),
      makeDraft([makeTab(TAB_ID, [makeWidget(WIDGET_ID, 0, TAB_ID)])]),
    );
    jotaiStore.set(
      pageLayoutCurrentLayoutsComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_ID,
      }),
      {
        [TAB_ID]: {
          desktop: [{ i: WIDGET_ID, x: 0, y: 0, w: 4, h: 2 }],
          mobile: [{ i: WIDGET_ID, x: 0, y: 0, w: 1, h: 2 }],
        },
      },
    );
    jotaiStore.set(
      pageLayoutEditingWidgetIdComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_ID,
      }),
      WIDGET_ID,
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
type Story = StoryObj<typeof meta>;

export const ToggleWithShortcuts: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);

    for (const modifier of ['Control', 'Meta']) {
      await userEvent.keyboard(`{${modifier}>}o{/${modifier}}`);
      const duplicateAction = await canvas.findByRole('menuitem', {
        name: 'Duplicate widget',
      });
      await waitFor(() => expect(duplicateAction).toHaveFocus());

      await userEvent.keyboard(`{${modifier}>}o{/${modifier}}`);
      await waitFor(() => {
        expect(canvas.queryByRole('menu')).not.toBeInTheDocument();
        expect(jotaiStore.get(focusStackState.atom)).toHaveLength(1);
      });
    }

    expect(
      jotaiStore.get(
        pageLayoutDraftComponentState.atomFamily({
          instanceId: PAGE_LAYOUT_ID,
        }),
      ).tabs[0].widgets,
    ).toHaveLength(1);
  },
};

export const DuplicateAndDeletePreserveBackgroundSelection: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'Options' });
    const draftState = pageLayoutDraftComponentState.atomFamily({
      instanceId: PAGE_LAYOUT_ID,
    });

    await userEvent.click(trigger);
    await userEvent.click(
      await canvas.findByRole('menuitem', { name: 'Duplicate widget' }),
    );

    expect(jotaiStore.get(draftState).tabs[0].widgets).toHaveLength(2);
    expect(
      jotaiStore.get(draftState).tabs[0].widgets.map(({ title }) => title),
    ).toContain('revenue (Copy)');
    expect(onBackgroundClickOutside).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(canvas.queryByRole('menu')).not.toBeInTheDocument();
      expect(trigger).toHaveFocus();
    });

    await userEvent.click(trigger);
    const duplicateAction = await canvas.findByRole('menuitem', {
      name: 'Duplicate widget',
    });
    await waitFor(() => expect(duplicateAction).toHaveFocus());
    await userEvent.keyboard('{ArrowDown}{Enter}');

    expect(
      jotaiStore.get(draftState).tabs[0].widgets.map(({ id }) => id),
    ).toEqual([WIDGET_ID]);
    await waitFor(() => {
      expect(canvas.queryByRole('menu')).not.toBeInTheDocument();
      expect(trigger).toHaveFocus();
    });
    expect(onBackgroundClickOutside).not.toHaveBeenCalled();

    await userEvent.click(canvasElement.ownerDocument.body);
    expect(onBackgroundClickOutside).toHaveBeenCalledTimes(1);
  },
};
