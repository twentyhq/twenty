import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { DashboardFilterBar } from '@/page-layout/components/DashboardFilterBar';
import { DashboardFiltersProvider } from '@/page-layout/components/DashboardFiltersProvider';
import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import {
  makeDraft,
  makeTab,
} from '@/page-layout/testing/pageLayoutDraftFixtures';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';
import {
  FeatureFlagKey,
  PageLayoutFilterType,
  PageLayoutType,
  ViewFilterOperand,
} from '~/generated-metadata/graphql';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';

const PERIOD_FILTER_ID = '6f2b8f1e-6a3c-4f4e-9d61-2f1c8a7b5e01';

// The bar renders once the mocked metadata has loaded
const FIRST_RENDER_TIMEOUT = { timeout: 10000 };

type DashboardFilterBarStoryProps = {
  initialSearch: string;
};

const DashboardFilterBarStory = ({
  initialSearch,
}: DashboardFilterBarStoryProps) => (
  <MemoryRouter initialEntries={[`/object/dashboard/1${initialSearch}`]}>
    <PageLayoutTestWrapper
      layoutType={PageLayoutType.DASHBOARD}
      store={jotaiStore}
    >
      <DashboardFiltersProvider>
        <DashboardFilterBar />
      </DashboardFiltersProvider>
    </PageLayoutTestWrapper>
  </MemoryRouter>
);

const meta: Meta<typeof DashboardFilterBarStory> = {
  title: 'Modules/PageLayout/DashboardFilterBar',
  component: DashboardFilterBarStory,
  decorators: [ComponentDecorator, ObjectMetadataItemsDecorator],
  parameters: { container: { width: 480, height: 320 } },
  args: { initialSearch: '' },
  beforeEach: () => {
    const previousWorkspace = jotaiStore.get(currentWorkspaceState.atom);

    jotaiStore.set(currentWorkspaceState.atom, {
      ...mockCurrentWorkspace,
      featureFlags: [
        { key: FeatureFlagKey.IS_DASHBOARD_FILTERS_ENABLED, value: true },
      ],
    });
    jotaiStore.set(
      pageLayoutPersistedComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      }),
      {
        ...makeDraft([makeTab('tab-1', [])]),
        id: PAGE_LAYOUT_TEST_INSTANCE_ID,
        type: PageLayoutType.DASHBOARD,
        applicationId: '',
        universalIdentifier: PAGE_LAYOUT_TEST_INSTANCE_ID,
        isSystemSideEffect: false,
        createdAt: '2026-08-01T00:00:00.000Z',
        updatedAt: '2026-08-01T00:00:00.000Z',
        filters: [
          {
            id: PERIOD_FILTER_ID,
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

    return () => jotaiStore.set(currentWorkspaceState.atom, previousWorkspace);
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const ShowsTheDefaultValue: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      await canvas.findByRole(
        'button',
        { name: 'Period: This month' },
        FIRST_RENDER_TIMEOUT,
      ),
    );

    expect(await body.findByText('Relative date')).toBeVisible();
    expect(body.queryByText('Reset to default')).not.toBeInTheDocument();
  },
};

export const ResetsAUrlValueToTheDefault: Story = {
  args: {
    initialSearch: `?dashboardFilter[${PERIOD_FILTER_ID}][IS_RELATIVE]=PAST_7_DAY`,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      await canvas.findByRole(
        'button',
        { name: 'Period: Past 7 days' },
        FIRST_RENDER_TIMEOUT,
      ),
    );
    await userEvent.click(await body.findByText('Reset to default'));

    expect(
      await canvas.findByRole('button', { name: 'Period: This month' }),
    ).toBeVisible();
  },
};

export const IgnoresAValueTheBarCannotShow: Story = {
  args: {
    initialSearch: `?dashboardFilter[${PERIOD_FILTER_ID}][IS_RELATIVE]=THIS_1_MONTH;;Bad/Zone;;`,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByRole(
        'button',
        { name: 'Period: This month' },
        FIRST_RENDER_TIMEOUT,
      ),
    ).toBeVisible();
  },
};

export const PicksAMonthInTheDatePicker: Story = {
  args: {
    initialSearch: `?dashboardFilter[${PERIOD_FILTER_ID}][IS_AFTER]=2026-01-10`,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      await canvas.findByRole(
        'button',
        { name: /^Period: From / },
        FIRST_RENDER_TIMEOUT,
      ),
    );
    const [startDateInput] = await body.findAllByRole('textbox', {
      name: 'Date',
    });
    await userEvent.click(startDateInput);
    await userEvent.click(await body.findByText('January'));

    const marchOption = await body.findByRole('option', { name: 'March' });
    const { left, top, width, height } = marchOption.getBoundingClientRect();

    const topmostElement = canvasElement.ownerDocument.elementFromPoint(
      left + width / 2,
      top + height / 2,
    );

    expect(topmostElement?.closest('[role="option"]')).toBe(marchOption);

    await userEvent.click(marchOption);
    await userEvent.click(
      await body.findByRole('gridcell', { name: /March 5th, 2026/ }),
    );

    expect(
      await canvas.findByRole('button', { name: /^Period: From Mar 5/ }),
    ).toBeVisible();
  },
};

export const KeepsTheValueWhenChoosingADateRange: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      await canvas.findByRole(
        'button',
        { name: 'Period: This month' },
        FIRST_RENDER_TIMEOUT,
      ),
    );
    await userEvent.click(await body.findByText('Relative date'));
    await userEvent.click(
      await body.findByRole('option', { name: 'Date range' }),
    );

    await waitFor(() =>
      expect(body.getAllByRole('textbox', { name: 'Date' })).toHaveLength(2),
    );
    expect(
      canvas.getByRole('button', { name: 'Period: This month' }),
    ).toBeVisible();
  },
};
