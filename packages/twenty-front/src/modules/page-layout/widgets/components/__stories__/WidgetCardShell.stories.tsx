import { type DashboardFilters } from '@/page-layout/types/DashboardFilters';
import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { isDashboardInEditModeComponentState } from '@/page-layout/states/isDashboardInEditModeComponentState';
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
import { widgetCardHoveredComponentFamilyState } from '@/page-layout/widgets/states/widgetCardHoveredComponentFamilyState';
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
  type ChartFilter,
  type PageLayoutFilterCondition,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { TEST_AGGREGATE_CHART_CONFIGURATION } from '~/testing/mock-data/widget-configurations';
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
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
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

const closeDateField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: opportunityObjectMetadataItem,
  fieldName: 'closeDate',
});

const createdAtField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: opportunityObjectMetadataItem,
  fieldName: 'createdAt',
});

const CREATED_AT_FIELD_LABEL = `Date range · ${createdAtField.label}`;

const expectEditModeFieldLabel = async (
  canvasElement: HTMLElement,
  text: string,
  fullText: string,
) => {
  const canvas = within(canvasElement);
  const body = within(canvasElement.ownerDocument.body);
  const label = await canvas.findByText(text);

  expect(label).toBeVisible();
  expect(canvas.getByRole('img', { name: fullText })).toBeInTheDocument();

  await userEvent.hover(label);

  expect(await body.findByText(fullText)).toBeVisible();

  return label;
};

const THIS_MONTH_CONDITIONS = [
  {
    operand: ViewFilterOperand.IS_RELATIVE,
    value: 'THIS_1_MONTH;;UTC;;MONDAY;;',
  },
];

type DashboardFilterWidgetCardShellStoryProps = {
  dashboardFilterBindings?: {
    pageLayoutFilterId: string;
    fieldMetadataId: string | null;
  }[];
  conditions?: PageLayoutFilterCondition[] | null;
  isInEditMode?: boolean;
  chartFilter?: ChartFilter;
  title?: string;
  width?: number;
};

const DashboardFilterWidgetCardShellStory = ({
  dashboardFilterBindings = [],
  conditions = THIS_MONTH_CONDITIONS,
  isInEditMode = false,
  chartFilter,
  title = 'Opportunities',
  width = 480,
}: DashboardFilterWidgetCardShellStoryProps) => {
  const store = createStore();
  const widget = {
    ...makeWidget('dashboard-filter-widget-story', 0),
    title,
    objectMetadataId: opportunityObjectMetadataItem.id,
    ...(isDefined(chartFilter)
      ? {
          type: WidgetType.GRAPH,
          configuration: {
            ...TEST_AGGREGATE_CHART_CONFIGURATION,
            filter: chartFilter,
            dashboardFilterBindings,
          },
        }
      : {
          type: WidgetType.RECORD_TABLE,
          configuration: {
            __typename: 'RecordTableConfiguration' as const,
            configurationType: WidgetConfigurationType.RECORD_TABLE,
            dashboardFilterBindings,
          },
        }),
  };
  const setWidgetCardHovered = (isHovered: boolean) =>
    store.set(
      widgetCardHoveredComponentFamilyState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
        familyKey: widget.id,
      }),
      isHovered,
    );

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
  store.set(
    isDashboardInEditModeComponentState.atomFamily({
      instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
    }),
    isInEditMode,
  );

  const dashboardFilters: DashboardFilters = {
    pageLayoutFilters: [DASHBOARD_DATE_RANGE_FILTER],
    urlValueByPageLayoutFilterId: {},
    values: isDefined(conditions)
      ? [
          {
            pageLayoutFilterId: DASHBOARD_DATE_RANGE_FILTER_ID,
            type: PageLayoutFilterType.DATE,
            conditions,
          },
        ]
      : [],
    timeZone: 'UTC',
    firstDayOfTheWeek: FirstDayOfTheWeek.MONDAY,
  };

  return (
    <div style={{ height: 200, width }}>
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
              isEditable={isInEditMode}
              isEditing={false}
              isDragging={false}
              isResizing={false}
              showHeader
              hasAccess
              restriction={{ type: null }}
              onRemove={() => undefined}
              onMouseEnter={() => setWidgetCardHovered(true)}
              onMouseLeave={() => setWidgetCardHovered(false)}
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

export const DashboardFilterFieldShownOnHover: Story = {
  render: () => <DashboardFilterWidgetCardShellStory />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    const indicator = await canvas.findByLabelText(CREATED_AT_FIELD_LABEL);

    expect(indicator).not.toBeVisible();

    await userEvent.hover(await canvas.findByText('Opportunities'));

    await waitFor(() => expect(indicator).toBeVisible());
    expect(canvas.queryByText(/Ignores|Also filtered/)).not.toBeInTheDocument();

    await userEvent.hover(indicator);

    expect(await body.findByText(CREATED_AT_FIELD_LABEL)).toBeVisible();
  },
};

export const DashboardFilterOverrideShownOnHover: Story = {
  render: () => (
    <DashboardFilterWidgetCardShellStory
      dashboardFilterBindings={[
        {
          pageLayoutFilterId: DASHBOARD_DATE_RANGE_FILTER_ID,
          fieldMetadataId: closeDateField.id,
        },
      ]}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.hover(await canvas.findByText('Opportunities'));

    expect(
      await canvas.findByLabelText('Date range · Close date'),
    ).toBeVisible();
    expect(
      canvas.queryByText('Date range · Close date'),
    ).not.toBeInTheDocument();
  },
};

export const DashboardFilterIgnoredPill: Story = {
  render: () => (
    <DashboardFilterWidgetCardShellStory
      dashboardFilterBindings={[
        {
          pageLayoutFilterId: DASHBOARD_DATE_RANGE_FILTER_ID,
          fieldMetadataId: null,
        },
      ]}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const pill = await canvas.findByText('Ignores Date range');

    await userEvent.hover(pill);

    expect(
      await body.findByText(
        "The Date range filter doesn't apply to this widget.",
      ),
    ).toBeVisible();
    expect(canvas.queryByLabelText(/Date range ·/)).not.toBeInTheDocument();
  },
};

export const DashboardFilterUnavailableFieldPill: Story = {
  render: () => (
    <DashboardFilterWidgetCardShellStory
      dashboardFilterBindings={[
        {
          pageLayoutFilterId: DASHBOARD_DATE_RANGE_FILTER_ID,
          fieldMetadataId: 'deleted-field-id',
        },
      ]}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.hover(await canvas.findByText('Ignores Date range'));

    expect(
      await body.findByText(
        "The date field chosen for Date range on this widget is unavailable. Pick another one in the widget's settings.",
      ),
    ).toBeVisible();
  },
};

export const DashboardFilterNothingWithoutAValue: Story = {
  render: () => (
    <DashboardFilterWidgetCardShellStory
      conditions={null}
      dashboardFilterBindings={[
        {
          pageLayoutFilterId: DASHBOARD_DATE_RANGE_FILTER_ID,
          fieldMetadataId: null,
        },
      ]}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.hover(await canvas.findByText('Opportunities'));

    expect(canvas.queryByText(/Date range/)).not.toBeInTheDocument();
    expect(canvas.queryByLabelText(/Date range/)).not.toBeInTheDocument();
  },
};

export const DashboardFilterFieldLabelInEditMode: Story = {
  render: () => (
    <DashboardFilterWidgetCardShellStory conditions={null} isInEditMode />
  ),
  play: async ({ canvasElement }) => {
    await expectEditModeFieldLabel(
      canvasElement,
      createdAtField.label,
      CREATED_AT_FIELD_LABEL,
    );
  },
};

export const DashboardFilterFieldLabelInEditModeOnANarrowWidget: Story = {
  render: () => (
    <DashboardFilterWidgetCardShellStory
      conditions={null}
      isInEditMode
      title="Total Pipeline Value This Quarter"
      width={220}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const label = await expectEditModeFieldLabel(
      canvasElement,
      createdAtField.label,
      CREATED_AT_FIELD_LABEL,
    );
    const title = canvas.getByText('Total Pipeline Value This Quarter');

    expect(label.scrollWidth).toBe(label.clientWidth);
    expect(title.scrollWidth).toBeGreaterThan(title.clientWidth);
  },
};

export const DashboardFilterIgnoredLabelInEditMode: Story = {
  render: () => (
    <DashboardFilterWidgetCardShellStory
      isInEditMode
      dashboardFilterBindings={[
        {
          pageLayoutFilterId: DASHBOARD_DATE_RANGE_FILTER_ID,
          fieldMetadataId: null,
        },
      ]}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expectEditModeFieldLabel(
      canvasElement,
      'Ignored',
      'Date range · Ignored',
    );
    expect(canvas.queryByText('Ignores Date range')).not.toBeInTheDocument();
  },
};

export const DashboardFilterUnavailableLabelInEditMode: Story = {
  render: () => (
    <DashboardFilterWidgetCardShellStory
      isInEditMode
      dashboardFilterBindings={[
        {
          pageLayoutFilterId: DASHBOARD_DATE_RANGE_FILTER_ID,
          fieldMetadataId: 'deleted-field-id',
        },
      ]}
    />
  ),
  play: async ({ canvasElement }) => {
    await expectEditModeFieldLabel(
      canvasElement,
      'Unavailable field',
      'Date range · Unavailable field',
    );
  },
};

export const DashboardFilterOverlapPill: Story = {
  render: () => (
    <DashboardFilterWidgetCardShellStory
      chartFilter={{
        recordFilters: [
          {
            id: 'close-date-condition',
            fieldMetadataId: closeDateField.id,
            operand: ViewFilterOperand.IS_NOT_EMPTY,
            value: '',
          },
        ],
        recordFilterGroups: [],
      }}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.hover(
      await canvas.findByText('Also filtered on Close date'),
    );

    expect(
      await body.findByText(
        "This widget's own filter also uses Close date. Both apply.",
      ),
    ).toBeVisible();
  },
};

export const DashboardFilterFieldLabelInEditModeWithAnInvalidDefault: Story = {
  render: () => (
    <DashboardFilterWidgetCardShellStory
      isInEditMode
      conditions={[
        { operand: ViewFilterOperand.IS_AFTER, value: '2026-02-31' },
      ]}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Invalid filter')).toBeVisible();
    await expectEditModeFieldLabel(
      canvasElement,
      createdAtField.label,
      CREATED_AT_FIELD_LABEL,
    );
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
    expect(canvas.queryByText(/Date range/)).not.toBeInTheDocument();
  },
};
