import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import {
  makeDraft,
  makeTab,
} from '@/page-layout/testing/pageLayoutDraftFixtures';
import { SidePanelDashboardFilterSettings } from '@/side-panel/pages/page-layout/components/dashboard/SidePanelDashboardFilterSettings';
import { PageLayoutSidePanelTargetContext } from '@/side-panel/pages/page-layout/contexts/PageLayoutSidePanelTargetContext';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';
import {
  PageLayoutFilterType,
  PageLayoutType,
  ViewFilterOperand,
} from '~/generated-metadata/graphql';

const PAGE_LAYOUT_ID = 'dashboard-filter-settings-story';

const getDraftFilters = () =>
  jotaiStore.get(
    pageLayoutDraftComponentState.atomFamily({ instanceId: PAGE_LAYOUT_ID }),
  ).filters;

const meta: Meta<typeof SidePanelDashboardFilterSettings> = {
  title: 'Modules/SidePanel/PageLayout/SidePanelDashboardFilterSettings',
  component: SidePanelDashboardFilterSettings,
  decorators: [
    (Story) => (
      <PageLayoutSidePanelTargetContext.Provider
        value={{
          pageLayoutId: PAGE_LAYOUT_ID,
          targetRecordIdentifier: {
            id: 'dashboard-record',
            targetObjectNameSingular: 'dashboard',
          },
        }}
      >
        <Story />
      </PageLayoutSidePanelTargetContext.Provider>
    ),
    ComponentDecorator,
  ],
  parameters: { container: { width: 400 } },
  beforeEach: () => {
    jotaiStore.set(
      pageLayoutDraftComponentState.atomFamily({ instanceId: PAGE_LAYOUT_ID }),
      {
        ...makeDraft([makeTab('tab-1', [])]),
        id: PAGE_LAYOUT_ID,
        type: PageLayoutType.DASHBOARD,
        filters: [
          {
            id: 'period-filter',
            label: 'Period',
            type: PageLayoutFilterType.DATE,
            position: 0,
            defaultValue: {
              conditions: [
                {
                  operand: ViewFilterOperand.IS_RELATIVE,
                  value: 'THIS_1_MONTH',
                },
              ],
            },
          },
        ],
      },
    );
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AddAndRemoveFilter: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      await canvas.findByRole('button', { name: 'Add date filter' }),
    );

    expect(await canvas.findByDisplayValue('Period 2')).toBeVisible();

    await userEvent.click(
      canvas.getAllByRole('button', { name: 'Remove filter' })[0],
    );

    await waitFor(() => {
      expect(getDraftFilters()?.map(({ label }) => label)).toEqual([
        'Period 2',
      ]);
    });
  },
};

export const SwitchToNoDefault: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(await canvas.findByText('Relative date'));
    await userEvent.click(await body.findByText('No default'));

    await waitFor(() => {
      expect(getDraftFilters()?.[0].defaultValue).toBeNull();
    });
  },
};

export const RejectsAmountAboveLimit: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(await canvas.findByText('This'));
    await userEvent.click(await body.findByText('Past'));
    await userEvent.type(await canvas.findByPlaceholderText('Number'), '5000');

    expect(
      await canvas.findByText('Use an amount of 1000 or less.'),
    ).toBeVisible();
    expect(
      getDraftFilters()?.[0].defaultValue?.conditions[0].value,
    ).not.toContain('5000');
  },
};
