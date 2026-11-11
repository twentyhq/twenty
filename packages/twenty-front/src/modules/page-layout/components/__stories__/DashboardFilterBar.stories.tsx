import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { DashboardFilterBar } from '@/page-layout/components/DashboardFilterBar';
import { DashboardFiltersProvider } from '@/page-layout/components/DashboardFiltersProvider';
import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { isDashboardInEditModeComponentState } from '@/page-layout/states/isDashboardInEditModeComponentState';
import { dashboardFilterSessionSearchFamilyState } from '@/page-layout/states/dashboardFilterSessionSearchFamilyState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import {
  makeDraft,
  makeTab,
} from '@/page-layout/testing/pageLayoutDraftFixtures';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { LayoutRenderingProvider } from '@/ui/layout/contexts/LayoutRenderingContext';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import {
  Link,
  MemoryRouter,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import {
  DASHBOARD_DATE_RANGE_FILTER,
  DASHBOARD_DATE_RANGE_FILTER_ID,
} from 'twenty-shared/constants';
import { type PageLayoutFilter } from 'twenty-shared/types';
import { ComponentDecorator } from 'twenty-ui/testing';
import {
  FeatureFlagKey,
  PageLayoutType,
  ViewFilterOperand,
} from '~/generated-metadata/graphql';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import {
  mockCurrentWorkspace,
  mockedUserData,
} from '~/testing/mock-data/users';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const DATE_RANGE_FILTER_ID = DASHBOARD_DATE_RANGE_FILTER_ID;
const DASHBOARD_RECORD_ID = 'dashboard-record-id';
const THIRD_PARTY_APPLICATION_ID = 'acme-application';

// The bar renders once the mocked metadata has loaded
const FIRST_RENDER_TIMEOUT = { timeout: 10000 };

const DATE_RANGE_FILTER: PageLayoutFilter = {
  ...DASHBOARD_DATE_RANGE_FILTER,
  defaultValue: {
    conditions: [
      { operand: ViewFilterOperand.IS_RELATIVE, value: 'THIS_1_MONTH' },
    ],
  },
};

const PAGE_LAYOUT_PERSISTED_ATOM = pageLayoutPersistedComponentState.atomFamily(
  { instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID },
);
const PAGE_LAYOUT_DRAFT_ATOM = pageLayoutDraftComponentState.atomFamily({
  instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
});
const IS_IN_EDIT_MODE_ATOM = isDashboardInEditModeComponentState.atomFamily({
  instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
});
const SESSION_SEARCH_ATOM = dashboardFilterSessionSearchFamilyState.atomFamily({
  pageLayoutId: PAGE_LAYOUT_TEST_INSTANCE_ID,
});

const getDashboardFilterSearchFor = (relativeValue: string) =>
  new URLSearchParams([
    [`dashboardFilter[${DATE_RANGE_FILTER_ID}][IS_RELATIVE]`, relativeValue],
  ]).toString();

const setDashboard = ({
  filters,
  applicationId = '',
}: {
  filters: PageLayoutFilter[] | null;
  applicationId?: string;
}) => {
  const pageLayout = {
    ...makeDraft([makeTab('tab-1', [])]),
    id: PAGE_LAYOUT_TEST_INSTANCE_ID,
    type: PageLayoutType.DASHBOARD,
    filters,
  };

  jotaiStore.set(PAGE_LAYOUT_PERSISTED_ATOM, {
    ...pageLayout,
    applicationId,
    universalIdentifier: PAGE_LAYOUT_TEST_INSTANCE_ID,
    isSystemSideEffect: false,
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
  });
  jotaiStore.set(PAGE_LAYOUT_DRAFT_ATOM, pageLayout);
};

type DashboardFilterBarStoryProps = {
  initialSearch: string;
};

const DashboardFilterBarStoryContent = () => (
  <PageLayoutTestWrapper
    layoutType={PageLayoutType.DASHBOARD}
    store={jotaiStore}
  >
    <LayoutRenderingProvider
      value={{
        targetRecordIdentifier: {
          id: DASHBOARD_RECORD_ID,
          targetObjectNameSingular: 'dashboard',
        },
        layoutType: PageLayoutType.DASHBOARD,
      }}
    >
      <DashboardFiltersProvider>
        <DashboardFilterBar />
      </DashboardFiltersProvider>
    </LayoutRenderingProvider>
  </PageLayoutTestWrapper>
);

const LocationSearchProbe = () => (
  <span data-testid="location-search">{useLocation().search}</span>
);

const DashboardFilterBarStory = ({
  initialSearch,
}: DashboardFilterBarStoryProps) => (
  <MemoryRouter initialEntries={[`/object/dashboard/1${initialSearch}`]}>
    <LocationSearchProbe />
    <DashboardFilterBarStoryContent />
  </MemoryRouter>
);

const DashboardFilterBarLeaveAndReturnStory = () => (
  <MemoryRouter initialEntries={['/object/dashboard/1']}>
    <Routes>
      <Route
        path="/object/dashboard/1"
        element={
          <>
            <Link to="/elsewhere">Leave</Link>
            <LocationSearchProbe />
            <DashboardFilterBarStoryContent />
          </>
        }
      />
      <Route
        path="/elsewhere"
        element={<Link to="/object/dashboard/1">Return</Link>}
      />
    </Routes>
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
    const previousUserWorkspace = jotaiStore.get(
      currentUserWorkspaceState.atom,
    );

    jotaiStore.set(currentWorkspaceState.atom, {
      ...mockCurrentWorkspace,
      featureFlags: [
        { key: FeatureFlagKey.IS_DASHBOARD_FILTERS_ENABLED, value: true },
      ],
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
      currentUserWorkspaceState.atom,
      mockedUserData.currentUserWorkspace,
    );
    jotaiStore.set(IS_IN_EDIT_MODE_ATOM, false);
    jotaiStore.set(SESSION_SEARCH_ATOM, '');
    setDashboard({ filters: [DATE_RANGE_FILTER] });

    return () => {
      jotaiStore.set(currentWorkspaceState.atom, previousWorkspace);
      jotaiStore.set(currentUserWorkspaceState.atom, previousUserWorkspace);
      jotaiStore.set(
        recordStoreFamilyState.atomFamily(DASHBOARD_RECORD_ID),
        null,
      );
    };
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const findChip = (canvasElement: HTMLElement, name: string | RegExp) =>
  within(canvasElement).findByRole('button', { name }, FIRST_RENDER_TIMEOUT);

export const ShowsTheDefaultValue: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      await findChip(canvasElement, 'Date range: This month'),
    );

    expect(await body.findByText('Relative date')).toBeVisible();
    expect(body.queryByText('Default for everyone')).not.toBeInTheDocument();
    expect(
      canvas.queryByRole('button', { name: 'Reset' }),
    ).not.toBeInTheDocument();
  },
};

export const ShowsTheBuiltInDateRangeOnADashboardWithoutFilters: Story = {
  beforeEach: () => setDashboard({ filters: null }),
  play: async ({ canvasElement }) => {
    expect(await findChip(canvasElement, 'Date range')).toBeVisible();
  },
};

export const ResetsAUrlValueToTheDefault: Story = {
  args: {
    initialSearch: `?dashboardFilter[${DATE_RANGE_FILTER_ID}][IS_RELATIVE]=PAST_7_DAY`,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const chip = await findChip(canvasElement, 'Date range: Past 7 days');
    const resetButton = canvas.getByRole('button', { name: 'Reset' });

    expect(chip).toBeVisible();
    expect(
      resetButton.compareDocumentPosition(chip) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    await userEvent.click(resetButton);

    expect(
      await canvas.findByRole('button', { name: 'Date range: This month' }),
    ).toBeVisible();
    expect(
      canvas.queryByRole('button', { name: 'Reset' }),
    ).not.toBeInTheDocument();
  },
};

export const HidesResetWhenTheUrlValueIsTheDefault: Story = {
  args: {
    initialSearch: `?dashboardFilter[${DATE_RANGE_FILTER_ID}][IS_RELATIVE]=THIS_1_MONTH`,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await findChip(canvasElement, 'Date range: This month'),
    ).toBeVisible();
    expect(
      canvas.queryByRole('button', { name: 'Reset' }),
    ).not.toBeInTheDocument();
  },
};

export const SetsTheViewValueAsTheDefault: Story = {
  args: {
    initialSearch: `?dashboardFilter[${DATE_RANGE_FILTER_ID}][IS_RELATIVE]=PAST_7_DAY`,
  },
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      await findChip(canvasElement, 'Date range: Past 7 days'),
    );
    await userEvent.click(await body.findByText('Set as default'));

    await waitFor(() =>
      expect(jotaiStore.get(IS_IN_EDIT_MODE_ATOM)).toBe(true),
    );
    expect(jotaiStore.get(PAGE_LAYOUT_DRAFT_ATOM).filters).toMatchObject([
      {
        id: DATE_RANGE_FILTER_ID,
        defaultValue: {
          conditions: [
            { operand: ViewFilterOperand.IS_RELATIVE, value: 'PAST_7_DAY' },
          ],
        },
      },
    ]);
    expect(
      await findChip(canvasElement, 'Date range: Past 7 days'),
    ).toBeVisible();
  },
};

export const HidesSetAsDefaultWithoutDashboardEditPermission: Story = {
  args: {
    initialSearch: `?dashboardFilter[${DATE_RANGE_FILTER_ID}][IS_RELATIVE]=PAST_7_DAY`,
  },
  // ObjectMetadataItemsDecorator sets the user workspace on mount, after beforeEach
  parameters: {
    currentUserWorkspace: {
      ...mockedUserData.currentUserWorkspace,
      objectRecordsPermissions: getTestEnrichedObjectMetadataItemsMock().map(
        ({ id }) => ({
          objectMetadataId: id,
          canReadAllRecords: true,
          canUpdateAllRecords: false,
          canSoftDeleteAllRecords: false,
          canDestroyAllRecords: false,
          restrictedFields: {},
        }),
      ),
    },
  },
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      await findChip(canvasElement, 'Date range: Past 7 days'),
    );

    expect(await body.findByText('Relative date')).toBeVisible();
    expect(body.queryByText('Set as default')).not.toBeInTheDocument();
  },
};

export const OffersSetAsDefaultOnADashboardOfAnApp: Story = {
  args: {
    initialSearch: `?dashboardFilter[${DATE_RANGE_FILTER_ID}][IS_RELATIVE]=PAST_7_DAY`,
  },
  beforeEach: () =>
    setDashboard({
      filters: [DATE_RANGE_FILTER],
      applicationId: THIRD_PARTY_APPLICATION_ID,
    }),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      await findChip(canvasElement, 'Date range: Past 7 days'),
    );

    expect(await body.findByText('Set as default')).toBeVisible();
  },
};

export const HidesSetAsDefaultOnADeletedDashboard: Story = {
  args: {
    initialSearch: `?dashboardFilter[${DATE_RANGE_FILTER_ID}][IS_RELATIVE]=PAST_7_DAY`,
  },
  beforeEach: () => {
    jotaiStore.set(recordStoreFamilyState.atomFamily(DASHBOARD_RECORD_ID), {
      id: DASHBOARD_RECORD_ID,
      __typename: 'Dashboard',
      deletedAt: '2026-08-02T00:00:00.000Z',
    });
  },
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      await findChip(canvasElement, 'Date range: Past 7 days'),
    );

    expect(await body.findByText('Relative date')).toBeVisible();
    expect(body.queryByText('Set as default')).not.toBeInTheDocument();
  },
};

export const HidesSetAsDefaultWhenTheValueIsTheDefault: Story = {
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      await findChip(canvasElement, 'Date range: This month'),
    );

    expect(await body.findByText('Relative date')).toBeVisible();
    expect(body.queryByText('Set as default')).not.toBeInTheDocument();
  },
};

export const HidesSetAsDefaultForAnInvalidDefault: Story = {
  beforeEach: () =>
    setDashboard({
      filters: [
        {
          ...DASHBOARD_DATE_RANGE_FILTER,
          defaultValue: {
            conditions: [
              {
                operand: ViewFilterOperand.IS_RELATIVE,
                value: 'PAST_99999_DAY',
              },
            ],
          },
        },
      ],
    }),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      await findChip(canvasElement, 'Date range: Other value'),
    );

    expect(
      await body.findByText(
        "This value can't be edited here. Pick another option to replace it.",
      ),
    ).toBeVisible();
    expect(body.queryByText('Set as default')).not.toBeInTheDocument();
  },
};

const chooseMode = async (
  canvasElement: HTMLElement,
  from: string,
  to: string,
) => {
  const body = within(canvasElement.ownerDocument.body);

  await userEvent.click(await body.findByText(from));
  await userEvent.click(await body.findByRole('option', { name: to }));
};

export const LeavesNoEntryForAllTimeWithoutADefault: Story = {
  args: {
    initialSearch: `?dashboardFilter[${DATE_RANGE_FILTER_ID}][IS_RELATIVE]=PAST_7_DAY`,
  },
  beforeEach: () => setDashboard({ filters: [DASHBOARD_DATE_RANGE_FILTER] }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      await findChip(canvasElement, 'Date range: Past 7 days'),
    );
    await chooseMode(canvasElement, 'Relative date', 'All time');

    await waitFor(() =>
      expect(canvas.getByTestId('location-search')).toBeEmptyDOMElement(),
    );
    expect(
      canvas.queryByRole('button', { name: 'Reset' }),
    ).not.toBeInTheDocument();
  },
};

export const LeavesNoEntryForTheDefaultValue: Story = {
  args: {
    initialSearch: `?dashboardFilter[${DATE_RANGE_FILTER_ID}][IS_RELATIVE]=THIS_1_WEEK`,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      await findChip(canvasElement, 'Date range: This week'),
    );
    await chooseMode(canvasElement, 'Week', 'Month');

    await waitFor(() =>
      expect(canvas.getByTestId('location-search')).toBeEmptyDOMElement(),
    );
    expect(
      await findChip(canvasElement, 'Date range: This month'),
    ).toBeVisible();
    expect(
      canvas.queryByRole('button', { name: 'Reset' }),
    ).not.toBeInTheDocument();
  },
};

export const KeepsAnEmptyEntryForAllTimeOverADefault: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      await findChip(canvasElement, 'Date range: This month'),
    );
    await chooseMode(canvasElement, 'Relative date', 'All time');

    await waitFor(() =>
      expect(canvas.getByTestId('location-search')).toHaveTextContent(
        `?${new URLSearchParams([[`dashboardFilter[${DATE_RANGE_FILTER_ID}]`, '']]).toString()}`,
      ),
    );
    expect(canvas.getByRole('button', { name: 'Reset' })).toBeVisible();
  },
};

export const EditsTheDefaultOfTheBuiltInDateRange: Story = {
  beforeEach: () => {
    jotaiStore.set(IS_IN_EDIT_MODE_ATOM, true);
    setDashboard({ filters: null });
  },
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(await findChip(canvasElement, 'Date range'));
    await userEvent.click(await body.findByText('All time'));
    await userEvent.click(
      await body.findByRole('option', { name: 'Relative date' }),
    );
    await userEvent.click(await body.findByText('Day'));
    await userEvent.click(await body.findByRole('option', { name: 'Week' }));

    expect(
      await findChip(canvasElement, 'Date range: This week'),
    ).toBeVisible();
    expect(jotaiStore.get(PAGE_LAYOUT_DRAFT_ATOM).filters).toMatchObject([
      {
        id: DASHBOARD_DATE_RANGE_FILTER_ID,
        label: 'Date range',
        defaultValue: {
          conditions: [
            { operand: ViewFilterOperand.IS_RELATIVE, value: 'THIS_1_WEEK' },
          ],
        },
      },
    ]);
  },
};

export const PicksBothDatesOfARangeFromTheCalendar: Story = {
  beforeEach: () => {
    jotaiStore.set(IS_IN_EDIT_MODE_ATOM, true);
    setDashboard({
      filters: [
        {
          ...DATE_RANGE_FILTER,
          defaultValue: {
            conditions: [
              { operand: ViewFilterOperand.IS_AFTER, value: '2026-03-02' },
              { operand: ViewFilterOperand.IS_BEFORE, value: '2026-03-29' },
            ],
          },
        },
      ],
    });
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(await findChip(canvasElement, /^Date range: Mar 2/));

    await userEvent.click(
      await body.findByRole('textbox', { name: 'Start date' }),
    );
    await userEvent.click(
      await body.findByRole('gridcell', { name: /March 10th, 2026/ }),
    );

    const endDayCells = await body.findAllByRole('gridcell', {
      name: /March 20th, 2026/,
    });

    expect(endDayCells).toHaveLength(1);

    await userEvent.click(endDayCells[0]);

    expect(
      await canvas.findByRole('button', {
        name: /^Date range: Mar 10(, 2026)? – Mar 20(, 2026)?$/,
      }),
    ).toBeVisible();
  },
};

export const EditsTheDefaultAndIgnoresTheUrlInEditMode: Story = {
  args: {
    initialSearch: `?dashboardFilter[${DATE_RANGE_FILTER_ID}][IS_RELATIVE]=PAST_7_DAY`,
  },
  beforeEach: () => {
    jotaiStore.set(IS_IN_EDIT_MODE_ATOM, true);
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      await findChip(canvasElement, 'Date range: This month'),
    );

    expect(await body.findByText('Default for everyone')).toBeVisible();
    expect(body.queryByText('Set as default')).not.toBeInTheDocument();
    expect(
      canvas.queryByRole('button', { name: 'Reset' }),
    ).not.toBeInTheDocument();

    await userEvent.click(await body.findByText('Relative date'));
    await userEvent.click(
      await body.findByRole('option', { name: 'All time' }),
    );

    expect(await findChip(canvasElement, 'Date range')).toBeVisible();
    expect(jotaiStore.get(PAGE_LAYOUT_DRAFT_ATOM).filters).toMatchObject([
      { id: DATE_RANGE_FILTER_ID, defaultValue: null },
    ]);
  },
};

export const IgnoresAValueTheBarCannotShow: Story = {
  args: {
    initialSearch: `?dashboardFilter[${DATE_RANGE_FILTER_ID}][IS_RELATIVE]=THIS_1_MONTH;;Bad/Zone;;`,
  },
  play: async ({ canvasElement }) => {
    expect(
      await findChip(canvasElement, 'Date range: This month'),
    ).toBeVisible();
  },
};

const EMPTY_RANGE_CONDITIONS = [
  { operand: ViewFilterOperand.IS_AFTER, value: '2024-03-10' },
  { operand: ViewFilterOperand.IS_BEFORE, value: '2024-03-10' },
];

const expectOtherValueInTheDropdown = async (canvasElement: HTMLElement) => {
  const body = within(canvasElement.ownerDocument.body);

  await userEvent.click(
    await findChip(canvasElement, 'Date range: Other value'),
  );

  expect(
    await body.findByText(
      "This value can't be edited here. Pick another option to replace it.",
    ),
  ).toBeVisible();
};

export const OpensAnEmptyRangeFromTheUrlAsOtherValue: Story = {
  args: {
    initialSearch: `?${EMPTY_RANGE_CONDITIONS.map(({ operand, value }) => `dashboardFilter[${DATE_RANGE_FILTER_ID}][${operand}]=${value}`).join('&')}`,
  },
  play: async ({ canvasElement }) => {
    await expectOtherValueInTheDropdown(canvasElement);

    expect(
      within(canvasElement).getByTestId('location-search'),
    ).toHaveTextContent('2024-03-10');
  },
};

export const OpensAnEmptyStoredDefaultAsOtherValueInEditMode: Story = {
  beforeEach: () => {
    jotaiStore.set(IS_IN_EDIT_MODE_ATOM, true);
    setDashboard({
      filters: [
        {
          ...DASHBOARD_DATE_RANGE_FILTER,
          defaultValue: { conditions: EMPTY_RANGE_CONDITIONS },
        },
      ],
    });
  },
  play: async ({ canvasElement }) => {
    await expectOtherValueInTheDropdown(canvasElement);

    expect(jotaiStore.get(PAGE_LAYOUT_DRAFT_ATOM).filters).toMatchObject([
      { defaultValue: { conditions: EMPTY_RANGE_CONDITIONS } },
    ]);
  },
};

export const PicksAMonthInTheDatePicker: Story = {
  args: {
    initialSearch: `?dashboardFilter[${DATE_RANGE_FILTER_ID}][IS_AFTER]=2026-01-10`,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(await findChip(canvasElement, /^Date range: From /));
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
      await canvas.findByRole('button', { name: /^Date range: From Mar 5/ }),
    ).toBeVisible();
  },
};

export const KeepsTheValueWhenChoosingACustomRange: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      await findChip(canvasElement, 'Date range: This month'),
    );
    await userEvent.click(await body.findByText('Relative date'));
    await userEvent.click(
      await body.findByRole('option', { name: 'Custom range' }),
    );

    expect(
      await body.findByRole('textbox', { name: 'Start date' }),
    ).toBeVisible();
    expect(
      canvas.getByRole('button', { name: 'Date range: This month' }),
    ).toBeVisible();
  },
};

export const RestoresTheRememberedValueOnReEntry: Story = {
  beforeEach: () => {
    jotaiStore.set(
      SESSION_SEARCH_ATOM,
      getDashboardFilterSearchFor('PAST_7_DAY'),
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await findChip(canvasElement, 'Date range: Past 7 days'),
    ).toBeVisible();
    expect(canvas.getByRole('button', { name: 'Reset' })).toBeVisible();
  },
};

export const RemembersAValueChosenOnTheChip: Story = {
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      await findChip(canvasElement, 'Date range: This month'),
    );
    await userEvent.click(await body.findByText('Month'));
    await userEvent.click(await body.findByRole('option', { name: 'Year' }));

    expect(
      await findChip(canvasElement, 'Date range: This year'),
    ).toBeVisible();
    expect(jotaiStore.get(SESSION_SEARCH_ATOM)).toBe(
      getDashboardFilterSearchFor('THIS_1_YEAR'),
    );
  },
};

export const ForgetsAValueEqualToTheDefault: Story = {
  args: {
    initialSearch: `?dashboardFilter[${DATE_RANGE_FILTER_ID}][IS_RELATIVE]=THIS_1_WEEK`,
  },
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      await findChip(canvasElement, 'Date range: This week'),
    );
    await waitFor(() =>
      expect(jotaiStore.get(SESSION_SEARCH_ATOM)).toBe(
        getDashboardFilterSearchFor('THIS_1_WEEK'),
      ),
    );
    await userEvent.click(await body.findByText('Week'));
    await userEvent.click(await body.findByRole('option', { name: 'Month' }));

    await waitFor(() => expect(jotaiStore.get(SESSION_SEARCH_ATOM)).toBe(''));
  },
};

export const ResetClearsTheRememberedValue: Story = {
  beforeEach: () => {
    jotaiStore.set(
      SESSION_SEARCH_ATOM,
      getDashboardFilterSearchFor('PAST_7_DAY'),
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await findChip(canvasElement, 'Date range: Past 7 days');
    await userEvent.click(canvas.getByRole('button', { name: 'Reset' }));

    expect(
      await findChip(canvasElement, 'Date range: This month'),
    ).toBeVisible();
    expect(jotaiStore.get(SESSION_SEARCH_ATOM)).toBe('');
    expect(
      canvas.queryByRole('button', { name: 'Reset' }),
    ).not.toBeInTheDocument();
  },
};

export const AUrlValueWinsOverTheRememberedValue: Story = {
  args: {
    initialSearch: `?${getDashboardFilterSearchFor('THIS_1_YEAR')}`,
  },
  beforeEach: () => {
    jotaiStore.set(
      SESSION_SEARCH_ATOM,
      getDashboardFilterSearchFor('PAST_7_DAY'),
    );
  },
  play: async ({ canvasElement }) => {
    expect(
      await findChip(canvasElement, 'Date range: This year'),
    ).toBeVisible();
    await waitFor(() =>
      expect(jotaiStore.get(SESSION_SEARCH_ATOM)).toBe(
        getDashboardFilterSearchFor('THIS_1_YEAR'),
      ),
    );
  },
};

export const EditModeIgnoresTheRememberedValue: Story = {
  beforeEach: () => {
    jotaiStore.set(IS_IN_EDIT_MODE_ATOM, true);
    jotaiStore.set(
      SESSION_SEARCH_ATOM,
      getDashboardFilterSearchFor('PAST_7_DAY'),
    );
  },
  play: async ({ canvasElement }) => {
    expect(
      await findChip(canvasElement, 'Date range: This month'),
    ).toBeVisible();
    expect(jotaiStore.get(SESSION_SEARCH_ATOM)).toBe(
      getDashboardFilterSearchFor('PAST_7_DAY'),
    );
  },
};

export const RestoresTheValueAfterLeavingAndReturning: Story = {
  render: () => <DashboardFilterBarLeaveAndReturnStory />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      await findChip(canvasElement, 'Date range: This month'),
    );
    await userEvent.click(await body.findByText('Month'));
    await userEvent.click(await body.findByRole('option', { name: 'Year' }));
    await findChip(canvasElement, 'Date range: This year');
    await userEvent.keyboard('{Escape}');

    await userEvent.click(canvas.getByRole('link', { name: 'Leave' }));
    await userEvent.click(await canvas.findByRole('link', { name: 'Return' }));

    expect(
      await findChip(canvasElement, 'Date range: This year'),
    ).toBeVisible();
    await waitFor(() =>
      expect(canvas.getByTestId('location-search')).toHaveTextContent(
        `?${getDashboardFilterSearchFor('THIS_1_YEAR')}`,
      ),
    );
  },
};
