import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import {
  makeDraft,
  makeTab,
} from '@/page-layout/testing/pageLayoutDraftFixtures';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
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
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';
import {
  TEST_AGGREGATE_CHART_CONFIGURATION,
  TEST_BAR_CHART_CONFIGURATION,
  createTestWidget,
} from '~/testing/mock-data/widget-configurations';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const PAGE_LAYOUT_ID = 'dashboard-filter-settings-story';
const THIRD_PARTY_APPLICATION_ID = 'acme-sync-application';

const opportunity = getMockObjectMetadataItemOrThrow('opportunity');
const company = getMockObjectMetadataItemOrThrow('company');
const closeDate = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: opportunity,
  fieldName: 'closeDate',
});
const companyCreatedAt = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: company,
  fieldName: 'createdAt',
});

const REVENUE_WIDGET = createTestWidget({
  id: 'revenue-widget',
  title: 'Revenue by close date',
  objectMetadataId: opportunity.id,
  configuration: {
    ...TEST_BAR_CHART_CONFIGURATION,
    primaryAxisGroupByFieldMetadataId: closeDate.id,
  },
});

const COMPANY_COUNT_WIDGET = createTestWidget({
  id: 'company-count-widget',
  title: 'Companies',
  objectMetadataId: company.id,
  configuration: TEST_AGGREGATE_CHART_CONFIGURATION,
});

const pageLayoutDraftState = pageLayoutDraftComponentState.atomFamily({
  instanceId: PAGE_LAYOUT_ID,
});

const getWidgetBindings = (widgetId: string) => {
  const widget = jotaiStore
    .get(pageLayoutDraftState)
    .tabs.flatMap((tab) => tab.widgets)
    .find(({ id }) => id === widgetId);

  return widget && 'dashboardFilterBindings' in widget.configuration
    ? widget.configuration.dashboardFilterBindings
    : undefined;
};

const setPersistedWidgets = (widgets: PageLayoutWidget[]) =>
  jotaiStore.set(
    pageLayoutPersistedComponentState.atomFamily({
      instanceId: PAGE_LAYOUT_ID,
    }),
    {
      ...jotaiStore.get(pageLayoutDraftState),
      applicationId: '',
      universalIdentifier: PAGE_LAYOUT_ID,
      isSystemSideEffect: false,
      createdAt: '2026-08-01T00:00:00.000Z',
      updatedAt: '2026-08-01T00:00:00.000Z',
      tabs: [makeTab('Overview', widgets)],
    },
  );

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
    ObjectMetadataItemsDecorator,
  ],
  parameters: { container: { width: 400 } },
  beforeEach: () => {
    jotaiStore.set(
      pageLayoutDraftComponentState.atomFamily({ instanceId: PAGE_LAYOUT_ID }),
      {
        ...makeDraft([
          makeTab('Overview', [REVENUE_WIDGET]),
          makeTab('Accounts', [COMPANY_COUNT_WIDGET], 1),
        ]),
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
    setPersistedWidgets([]);
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

export const AppliesToEveryWidget: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    expect(await canvas.findByText('Applies to')).toBeVisible();
    expect(canvas.getByText('Revenue by close date in Overview')).toBeVisible();
    expect(canvas.getByText('Companies in Accounts')).toBeVisible();
    expect(canvas.getByText(`Automatic (${closeDate.label})`)).toBeVisible();

    await userEvent.click(
      canvas.getByText(`Automatic (${companyCreatedAt.label})`),
    );
    await userEvent.click(await body.findByText('Not applied'));

    expect(await canvas.findByText('Not applied')).toBeVisible();
    await waitFor(() =>
      expect(getWidgetBindings(COMPANY_COUNT_WIDGET.id)).toEqual([
        { pageLayoutFilterId: 'period-filter', fieldMetadataId: null },
      ]),
    );

    expect(getWidgetBindings(REVENUE_WIDGET.id)).toBeUndefined();
  },
};

export const AppWidgetIsReadOnly: Story = {
  beforeEach: () => {
    const previousWorkspace = jotaiStore.get(currentWorkspaceState.atom);

    jotaiStore.set(currentWorkspaceState.atom, {
      ...mockCurrentWorkspace,
      installedApplications: [
        ...mockCurrentWorkspace.installedApplications,
        {
          id: THIRD_PARTY_APPLICATION_ID,
          name: 'Acme Sync',
          universalIdentifier: THIRD_PARTY_APPLICATION_ID,
          logoUrl: null,
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      ],
    });
    setPersistedWidgets([
      { ...REVENUE_WIDGET, applicationId: THIRD_PARTY_APPLICATION_ID },
    ]);

    return () => jotaiStore.set(currentWorkspaceState.atom, previousWorkspace);
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      await canvas.findByText(`Automatic (${closeDate.label})`),
    );

    expect(body.queryByText('Not applied')).not.toBeInTheDocument();
  },
};

export const RemoveBlockedByAppWidget: Story = {
  beforeEach: () => {
    const previousWorkspace = jotaiStore.get(currentWorkspaceState.atom);

    jotaiStore.set(currentWorkspaceState.atom, {
      ...mockCurrentWorkspace,
      installedApplications: [
        ...mockCurrentWorkspace.installedApplications,
        {
          id: THIRD_PARTY_APPLICATION_ID,
          name: 'Acme Sync',
          universalIdentifier: THIRD_PARTY_APPLICATION_ID,
          logoUrl: null,
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      ],
    });
    setPersistedWidgets([
      {
        ...REVENUE_WIDGET,
        applicationId: THIRD_PARTY_APPLICATION_ID,
        configuration: {
          ...TEST_BAR_CHART_CONFIGURATION,
          dashboardFilterBindings: [
            { pageLayoutFilterId: 'period-filter', fieldMetadataId: null },
          ],
        },
      },
    ]);

    return () => jotaiStore.set(currentWorkspaceState.atom, previousWorkspace);
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByRole('button', { name: 'Remove filter' }),
    ).toBeDisabled();
  },
};
