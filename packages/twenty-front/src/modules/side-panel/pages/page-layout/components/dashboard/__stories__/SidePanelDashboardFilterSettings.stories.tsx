import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
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
import { mockCurrentWorkspace } from '~/testing/mock-data/users';
import {
  TEST_BAR_CHART_CONFIGURATION,
  createTestWidget,
} from '~/testing/mock-data/widget-configurations';

const PAGE_LAYOUT_ID = 'dashboard-filter-settings-story';
const THIRD_PARTY_APPLICATION_ID = 'acme-application';

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
    const addFilterButton = await canvas.findByRole('button', {
      name: 'Add date filter',
    });

    await userEvent.click(addFilterButton);

    expect(await canvas.findByDisplayValue('Period 2')).toBeVisible();

    await userEvent.click(
      canvas.getAllByRole('button', { name: 'Remove filter' })[0],
    );

    await waitFor(() => {
      expect(canvas.queryByDisplayValue('Period')).not.toBeInTheDocument();
    });

    await userEvent.click(addFilterButton);

    expect(await canvas.findByDisplayValue('Period')).toBeVisible();
    expect(canvas.getAllByDisplayValue(/^Period/)).toHaveLength(2);
  },
};

export const SwitchToNoDefault: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    expect(await canvas.findByPlaceholderText('-')).toBeVisible();

    await userEvent.click(await canvas.findByText('Relative date'));
    await userEvent.click(await body.findByText('No default'));

    expect(await canvas.findByText('No default')).toBeVisible();
    await waitFor(() => {
      expect(canvas.queryByPlaceholderText('-')).not.toBeInTheDocument();
    });
  },
};

export const RemoveBlockedByAppWidget: Story = {
  beforeEach: () => {
    jotaiStore.set(currentWorkspaceState.atom, {
      ...mockCurrentWorkspace,
      installedApplications: [
        ...mockCurrentWorkspace.installedApplications,
        {
          ...mockCurrentWorkspace.installedApplications[0],
          id: THIRD_PARTY_APPLICATION_ID,
          universalIdentifier: 'acme',
        },
      ],
    });
    jotaiStore.set(
      pageLayoutPersistedComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_ID,
      }),
      {
        ...makeDraft([
          makeTab('tab-1', [
            createTestWidget({
              applicationId: THIRD_PARTY_APPLICATION_ID,
              configuration: {
                ...TEST_BAR_CHART_CONFIGURATION,
                dashboardFilterBindings: [
                  {
                    pageLayoutFilterId: 'period-filter',
                    fieldMetadataId: null,
                  },
                ],
              },
            }),
          ]),
        ]),
        id: PAGE_LAYOUT_ID,
        type: PageLayoutType.DASHBOARD,
        applicationId: '',
        universalIdentifier: PAGE_LAYOUT_ID,
        isSystemSideEffect: false,
        createdAt: '2026-08-01T00:00:00.000Z',
        updatedAt: '2026-08-01T00:00:00.000Z',
      },
    );

    return () => {
      jotaiStore.set(currentWorkspaceState.atom, mockCurrentWorkspace);
      jotaiStore.set(
        pageLayoutPersistedComponentState.atomFamily({
          instanceId: PAGE_LAYOUT_ID,
        }),
        undefined,
      );
    };
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByRole('button', { name: 'Remove filter' }),
    ).toBeDisabled();
  },
};
