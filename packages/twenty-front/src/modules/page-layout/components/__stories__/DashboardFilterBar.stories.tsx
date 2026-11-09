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
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { DASHBOARD_DATE_RANGE_FILTER } from 'twenty-shared/constants';
import { ComponentDecorator } from 'twenty-ui/testing';
import {
  PageLayoutType,
  ViewFilterOperand,
} from '~/generated-metadata/graphql';

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
    const pageLayout = {
      ...makeDraft([makeTab('tab-1', [])]),
      id: PAGE_LAYOUT_TEST_INSTANCE_ID,
      type: PageLayoutType.DASHBOARD,
      filters: null,
    };

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
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const EditsTheDefaultOfTheBuiltInDateRange: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      await canvas.findByRole('button', { name: 'Date range' }),
    );

    expect(await body.findByText('Default for everyone')).toBeVisible();

    await userEvent.click(await body.findByText('No date range'));
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
      filters: [
        {
          ...DASHBOARD_DATE_RANGE_FILTER,
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

    await userEvent.click(
      await canvas.findByRole('button', { name: /^Date range: Mar 2/ }),
    );

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
    expect(body.getByText('Default for everyone')).toBeVisible();
  },
};
