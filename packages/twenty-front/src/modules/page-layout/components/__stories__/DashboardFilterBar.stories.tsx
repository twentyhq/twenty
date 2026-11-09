import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { DashboardFilterBar } from '@/page-layout/components/DashboardFilterBar';
import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { isDashboardInEditModeComponentState } from '@/page-layout/states/isDashboardInEditModeComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import {
  makeDraft,
  makeTab,
} from '@/page-layout/testing/pageLayoutDraftFixtures';
import { getDashboardPageLayoutFilters } from '@/page-layout/utils/getDashboardPageLayoutFilters';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { isDefined } from 'twenty-shared/utils';
import { ComponentDecorator } from 'twenty-ui/testing';
import {
  PageLayoutType,
  ViewFilterOperand,
} from '~/generated-metadata/graphql';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';

const THIRD_PARTY_APPLICATION_ID = 'acme-application';

const PAGE_LAYOUT_PERSISTED_ATOM = pageLayoutPersistedComponentState.atomFamily(
  { instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID },
);
const PAGE_LAYOUT_DRAFT_ATOM = pageLayoutDraftComponentState.atomFamily({
  instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
});

const DashboardFilterBarStory = () => (
  <PageLayoutTestWrapper
    layoutType={PageLayoutType.DASHBOARD}
    store={jotaiStore}
  >
    <DashboardFilterBar />
  </PageLayoutTestWrapper>
);

const meta: Meta<typeof DashboardFilterBarStory> = {
  title: 'Modules/PageLayout/DashboardFilterBar',
  component: DashboardFilterBarStory,
  decorators: [ComponentDecorator],
  parameters: { container: { width: 480, height: 320 } },
  beforeEach: () => {
    const previousWorkspace = jotaiStore.get(currentWorkspaceState.atom);
    const pageLayout = {
      ...makeDraft([makeTab('tab-1', [])]),
      id: PAGE_LAYOUT_TEST_INSTANCE_ID,
      type: PageLayoutType.DASHBOARD,
      filters: null,
    };

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
    jotaiStore.set(PAGE_LAYOUT_PERSISTED_ATOM, {
      ...pageLayout,
      applicationId: '',
      universalIdentifier: PAGE_LAYOUT_TEST_INSTANCE_ID,
      isSystemSideEffect: false,
      createdAt: '2026-08-01T00:00:00.000Z',
      updatedAt: '2026-08-01T00:00:00.000Z',
    });
    jotaiStore.set(PAGE_LAYOUT_DRAFT_ATOM, pageLayout);
    jotaiStore.set(
      isDashboardInEditModeComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      }),
      true,
    );

    return () => jotaiStore.set(currentWorkspaceState.atom, previousWorkspace);
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const EditsTheDefaultOfTheBuiltInDateRange: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      await canvas.findByRole('button', { name: 'Date range: All time' }),
    );

    expect(await body.findByText('Default for everyone')).toBeVisible();

    await userEvent.click(await body.findByText('All time'));
    await userEvent.click(
      await body.findByRole('option', { name: 'Relative date' }),
    );
    await userEvent.click(await body.findByText('Day'));
    await userEvent.click(await body.findByRole('option', { name: 'Week' }));

    expect(
      await canvas.findByRole('button', { name: 'Date range: This week' }),
    ).toBeVisible();
    expect(jotaiStore.get(PAGE_LAYOUT_DRAFT_ATOM).filters).toHaveLength(1);
  },
};

export const PicksBothDatesOfARangeFromTheCalendar: Story = {
  beforeEach: () => {
    const pageLayoutDraft = jotaiStore.get(PAGE_LAYOUT_DRAFT_ATOM);

    jotaiStore.set(PAGE_LAYOUT_DRAFT_ATOM, {
      ...pageLayoutDraft,
      filters: getDashboardPageLayoutFilters(null).map((filter) => ({
        ...filter,
        defaultValue: {
          conditions: [
            { operand: ViewFilterOperand.IS_AFTER, value: '2026-03-02' },
            { operand: ViewFilterOperand.IS_BEFORE, value: '2026-03-29' },
          ],
        },
      })),
    });
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      await canvas.findByRole('button', { name: /^Date range: Mar 2/ }),
    );

    const [startDateInput, endDateInput] = await body.findAllByRole('textbox', {
      name: 'Date',
    });

    await userEvent.click(startDateInput);
    await userEvent.click(
      await body.findByRole('gridcell', { name: /March 10th, 2026/ }),
    );
    await userEvent.click(endDateInput);

    // The start date's calendar may still be open next to the end date's
    const endDayCells = await body.findAllByRole('gridcell', {
      name: /March 20th, 2026/,
    });

    await userEvent.click(endDayCells[endDayCells.length - 1]);

    expect(
      await canvas.findByRole('button', {
        name: /^Date range: Mar 10(, 2026)? – Mar 20(, 2026)?$/,
      }),
    ).toBeVisible();
    expect(body.getByText('Default for everyone')).toBeVisible();
  },
};

export const IsLockedOnADashboardOfAnApp: Story = {
  beforeEach: () => {
    const pageLayoutPersisted = jotaiStore.get(PAGE_LAYOUT_PERSISTED_ATOM);

    if (isDefined(pageLayoutPersisted)) {
      jotaiStore.set(PAGE_LAYOUT_PERSISTED_ATOM, {
        ...pageLayoutPersisted,
        applicationId: THIRD_PARTY_APPLICATION_ID,
      });
    }
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const chip = await canvas.findByRole('button', {
      name: 'Date range: All time',
    });

    expect(chip).toHaveAttribute('aria-disabled', 'true');

    await userEvent.hover(chip);

    expect(await body.findByText('Managed by an app')).toBeVisible();
  },
};
