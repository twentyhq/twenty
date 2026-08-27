import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutTabSettingsOpenTabIdComponentState } from '@/page-layout/states/pageLayoutTabSettingsOpenTabIdComponentState';
import {
  makeDraft,
  makeTab,
  makeWidget,
} from '@/page-layout/testing/pageLayoutDraftFixtures';
import { getTabListInstanceIdFromPageLayoutAndRecord } from '@/page-layout/utils/getTabListInstanceIdFromPageLayoutAndRecord';
import { SIDE_PANEL_FOCUS_ID } from '@/side-panel/constants/SidePanelFocusId';
import { SidePanelPageLayoutTabSettingsContent } from '@/side-panel/pages/page-layout/components/SidePanelPageLayoutTabSettingsContent';
import { TabListFromUrlOptionalEffect } from '@/ui/layout/tab-list/components/TabListFromUrlOptionalEffect';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { TabListComponentInstanceContext } from '@/ui/layout/tab-list/states/contexts/TabListComponentInstanceContext';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { expect, userEvent, within } from 'storybook/test';
import { PageLayoutType } from '~/generated-metadata/graphql';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';

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

const CurrentTabLocation = () => {
  const { hash } = useLocation();

  return <output aria-label="Current tab URL">{hash}</output>;
};

const meta: Meta<typeof SidePanelPageLayoutTabSettingsContent> = {
  title: 'Modules/SidePanel/PageLayout/SidePanelPageLayoutTabSettingsContent',
  component: SidePanelPageLayoutTabSettingsContent,
  args: { pageLayoutId: PAGE_LAYOUT_ID, recordId: RECORD_ID },
  beforeEach: ({ parameters }) => {
    jotaiStore.set(
      pageLayoutDraftComponentState.atomFamily({ instanceId: PAGE_LAYOUT_ID }),
      makeDraft([
        makeTab(
          'home',
          parameters.singleWidget ? [makeWidget('home-widget', 0, 'home')] : [],
          0,
        ),
        makeTab('timeline', [], 1),
      ]),
    );
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
        <TabListComponentInstanceContext.Provider
          value={{ instanceId: TAB_LIST_INSTANCE_ID }}
        >
          <TabListFromUrlOptionalEffect
            tabListIds={['home', 'timeline']}
            isInSidePanel={false}
          />
          <Story />
          <CurrentTabLocation />
        </TabListComponentInstanceContext.Provider>
      </MemoryRouter>
    ),
  ],
  play: async ({ canvasElement }) => {
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
