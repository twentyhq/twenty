import { type DashboardFilters } from '@/page-layout/types/DashboardFilters';
import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import {
  makeDraft,
  makeTab,
  makeWidget,
} from '@/page-layout/testing/pageLayoutDraftFixtures';
import { PageLayoutContentProvider } from '@/page-layout/contexts/PageLayoutContentContext';
import { WidgetCardShell } from '@/page-layout/widgets/components/WidgetCardShell';
import { WidgetDashboardFilterProvider } from '@/page-layout/widgets/components/WidgetDashboardFilterProvider';
import { type WidgetCardVariant } from '@/page-layout/widgets/types/WidgetCardVariant';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { createStore } from 'jotai';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import {
  DASHBOARD_DATE_RANGE_FILTER,
  DASHBOARD_DATE_RANGE_FILTER_ID,
} from 'twenty-shared/constants';
import {
  FirstDayOfTheWeek,
  type PageLayoutFilterCondition,
} from 'twenty-shared/types';
import {
  PageLayoutFilterType,
  PageLayoutTabLayoutMode,
  PageLayoutType,
  PageLayoutWidgetVerticalListHeightBehavior,
  ViewFilterOperand,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';
import { MockedMetadataLoadEffect } from '~/testing/decorators/MockedMetadataLoadEffect';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

type WidgetCardShellStoryProps = {
  isEditable: boolean;
  heightBehavior?: PageLayoutWidgetVerticalListHeightBehavior;
  pageLayoutType: PageLayoutType;
  variant: WidgetCardVariant;
  widgetType: WidgetType;
};

const WidgetCardShellStory = ({
  heightBehavior,
  isEditable,
  pageLayoutType,
  variant,
  widgetType,
}: WidgetCardShellStoryProps) => {
  const store = createStore();
  const widget = {
    ...makeWidget('widget-card-shell-story', 0),
    type: widgetType,
    position: {
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      index: 0,
      heightBehavior,
    },
  };
  const pageLayout: PageLayout = {
    ...makeDraft([makeTab('tab-1', [widget])]),
    applicationId: '',
    createdAt: '2026-08-22T00:00:00.000Z',
    deletedAt: null,
    isSystemSideEffect: false,
    type: pageLayoutType,
    universalIdentifier: 'widget-card-shell-layout',
    updatedAt: '2026-08-22T00:00:00.000Z',
  };

  store.set(
    pageLayoutPersistedComponentState.atomFamily({
      instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
    }),
    pageLayout,
  );
  store.set(
    pageLayoutDraftComponentState.atomFamily({
      instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
    }),
    pageLayout,
  );

  return (
    <div style={{ height: 200, width: 300 }}>
      <PageLayoutTestWrapper layoutType={pageLayoutType} store={store}>
        <PageLayoutContentProvider
          value={{
            layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
            presentation: 'stack',
            tabId: 'tab-1',
          }}
        >
          <WidgetCardShell
            widget={widget}
            variant={variant}
            isEditable={isEditable}
            isEditing={false}
            isDragging={false}
            isResizing={false}
            showHeader={false}
            hasAccess={false}
            restriction={{ type: null }}
            onRemove={() => undefined}
          />
        </PageLayoutContentProvider>
      </PageLayoutTestWrapper>
    </div>
  );
};

const opportunityObjectMetadataItem =
  getMockObjectMetadataItemOrThrow('opportunity');

const THIS_MONTH_CONDITIONS = [
  {
    operand: ViewFilterOperand.IS_RELATIVE,
    value: 'THIS_1_MONTH;;UTC;;MONDAY;;',
  },
];

type DashboardFilterWidgetCardShellStoryProps = {
  conditions?: PageLayoutFilterCondition[];
};

const DashboardFilterWidgetCardShellStory = ({
  conditions = THIS_MONTH_CONDITIONS,
}: DashboardFilterWidgetCardShellStoryProps) => {
  const store = createStore();
  const widget = {
    ...makeWidget('dashboard-filter-widget-story', 0),
    title: 'Opportunities',
    type: WidgetType.RECORD_TABLE,
    objectMetadataId: opportunityObjectMetadataItem.id,
    configuration: {
      __typename: 'RecordTableConfiguration' as const,
      configurationType: WidgetConfigurationType.RECORD_TABLE,
    },
  };

  store.set(
    pageLayoutPersistedComponentState.atomFamily({
      instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
    }),
    {
      ...makeDraft([makeTab('tab-1', [widget])]),
      type: PageLayoutType.DASHBOARD,
      applicationId: '',
      createdAt: '2026-08-22T00:00:00.000Z',
      deletedAt: null,
      isSystemSideEffect: false,
      universalIdentifier: 'dashboard-filter-widget-card-shell-layout',
      updatedAt: '2026-08-22T00:00:00.000Z',
    },
  );

  const dashboardFilters: DashboardFilters = {
    pageLayoutFilters: [DASHBOARD_DATE_RANGE_FILTER],
    urlValueByPageLayoutFilterId: {},
    values: [
      {
        pageLayoutFilterId: DASHBOARD_DATE_RANGE_FILTER_ID,
        type: PageLayoutFilterType.DATE,
        conditions,
      },
    ],
    timeZone: 'UTC',
    firstDayOfTheWeek: FirstDayOfTheWeek.MONDAY,
  };

  return (
    <div style={{ height: 200, width: 480 }}>
      <PageLayoutTestWrapper
        layoutType={PageLayoutType.DASHBOARD}
        store={store}
      >
        <MockedMetadataLoadEffect />
        <PageLayoutContentProvider
          value={{
            layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
            presentation: 'stack',
            tabId: 'tab-1',
          }}
        >
          <WidgetDashboardFilterProvider
            widget={widget}
            dashboardFilters={dashboardFilters}
          >
            <WidgetCardShell
              widget={widget}
              variant="framed"
              isEditable={false}
              isEditing={false}
              isDragging={false}
              isResizing={false}
              showHeader
              hasAccess
              restriction={{ type: null }}
              onRemove={() => undefined}
            />
          </WidgetDashboardFilterProvider>
        </PageLayoutContentProvider>
      </PageLayoutTestWrapper>
    </div>
  );
};

const meta: Meta<typeof WidgetCardShellStory> = {
  title: 'Modules/PageLayout/Widgets/WidgetCardShell',
  component: WidgetCardShellStory,
  args: {
    isEditable: false,
    pageLayoutType: PageLayoutType.RECORD_PAGE,
    variant: 'flush',
    widgetType: WidgetType.IFRAME,
  },
};

export default meta;
type Story = StoryObj<typeof WidgetCardShellStory>;

const getWidgetContent = (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement);
  const card = canvas.getByTestId('widget-card-shell-story');
  const content = card.firstElementChild;

  if (!(content instanceof HTMLElement)) {
    throw new Error('Widget content not found');
  }

  return content;
};

export const RecordPageIframe: Story = {
  play: async ({ canvasElement }) => {
    const content = getWidgetContent(canvasElement);
    const rootFontSizeInPixels = Number.parseFloat(
      getComputedStyle(content.ownerDocument.documentElement).fontSize,
    );

    await waitFor(() =>
      expect(getComputedStyle(content).minHeight).toBe(
        `${40 * rootFontSizeInPixels}px`,
      ),
    );
  },
};

export const RecordPageFitContentIframe: Story = {
  args: {
    heightBehavior: PageLayoutWidgetVerticalListHeightBehavior.FIT_CONTENT,
  },
  play: RecordPageIframe.play,
};

export const RecordPageViewportIframe: Story = {
  args: {
    heightBehavior: PageLayoutWidgetVerticalListHeightBehavior.TAB_VIEWPORT,
  },
  play: async ({ canvasElement }) => {
    const content = getWidgetContent(canvasElement);

    await waitFor(() => {
      expect(getComputedStyle(content).minHeight).toBe('0px');
      expect(content.getBoundingClientRect().height).toBe(200);
    });
  },
};

export const StandalonePageIframe: Story = {
  args: {
    pageLayoutType: PageLayoutType.STANDALONE_PAGE,
  },
  play: async ({ canvasElement }) => {
    const content = getWidgetContent(canvasElement);

    await waitFor(() =>
      expect(getComputedStyle(content).minHeight).toBe('0px'),
    );
  },
};

export const FlushWorkflow: Story = {
  args: {
    widgetType: WidgetType.WORKFLOW,
  },
  play: async ({ canvasElement }) => {
    const content = getWidgetContent(canvasElement);

    await waitFor(() =>
      expect(getComputedStyle(content).paddingTop).toBe('0px'),
    );
  },
};

export const FlushTasks: Story = {
  args: {
    widgetType: WidgetType.TASKS,
  },
  play: async ({ canvasElement }) => {
    const content = getWidgetContent(canvasElement);

    await waitFor(() =>
      expect(getComputedStyle(content).paddingTop).not.toBe('0px'),
    );
  },
};

export const DashboardFilterApplied: Story = {
  render: () => <DashboardFilterWidgetCardShellStory />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Opportunities')).toBeVisible();
    expect(canvas.queryByText('Invalid filter')).not.toBeInTheDocument();
  },
};

export const InvalidDashboardFilter: Story = {
  render: () => (
    <DashboardFilterWidgetCardShellStory
      conditions={[
        { operand: ViewFilterOperand.IS_AFTER, value: '2026-02-31' },
      ]}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Invalid filter')).toBeVisible();

    await userEvent.hover(canvas.getByText('Invalid filter'));

    expect(
      await within(canvasElement.ownerDocument.body).findByText(
        'The dashboard date range is not valid. Pick another range.',
      ),
    ).toBeVisible();
  },
};
