import {
  useApolloClient,
  type ApolloClient,
  type NormalizedCacheObject,
} from '@apollo/client';
import { type MockedResponse } from '@apollo/client/testing';
import { type Meta, type StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import { type MutableSnapshot } from 'recoil';
import { CatalogDecorator, type CatalogStory } from 'twenty-ui/testing';

import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { ApolloCoreClientContext } from '@/object-metadata/contexts/ApolloCoreClientContext';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { shouldAppBeLoadingState } from '@/object-metadata/states/shouldAppBeLoadingState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { PageLayoutContentProvider } from '@/page-layout/contexts/PageLayoutContentContext';

import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { WidgetRenderer } from '@/page-layout/widgets/components/WidgetRenderer';

import { generateGroupByAggregateQuery } from '@/object-record/record-aggregate/utils/generateGroupByAggregateQuery';
import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { isPageLayoutInEditModeComponentState } from '@/page-layout/states/isPageLayoutInEditModeComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutDraggingWidgetIdComponentState } from '@/page-layout/states/pageLayoutDraggingWidgetIdComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { widgetCardHoveredComponentFamilyState } from '@/page-layout/widgets/states/widgetCardHoveredComponentFamilyState';
import { type WidgetCardVariant } from '@/page-layout/widgets/types/WidgetCardVariant';
import { LayoutRenderingProvider } from '@/ui/layout/contexts/LayoutRenderingContext';
import { GraphOrderBy, WidgetType } from '~/generated-metadata/graphql';
import {
  AggregateOperations,
  AxisNameDisplay,
  BarChartLayout,
  PageLayoutType,
  WidgetConfigurationType,
} from '~/generated/graphql';
import { ChipGeneratorsDecorator } from '~/testing/decorators/ChipGeneratorsDecorator';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow(
  CoreObjectNameSingular.Company,
);
const idField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: companyObjectMetadataItem,
  fieldName: 'id',
});
const createdAtField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: companyObjectMetadataItem,
  fieldName: 'createdAt',
});
const accountOwnerField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: companyObjectMetadataItem,
  fieldName: 'accountOwner',
});
const companyPeopleField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: companyObjectMetadataItem,
  fieldName: 'people',
});

const TEST_RECORD_ID = 'test-record-123';
const TEST_PERSON_RECORD_ID = 'test-person-456';

// Widget ID constants for stories
const WIDGET_ID_NUMBER_CHART = 'widget-number-chart';
const WIDGET_ID_GAUGE_CHART = 'widget-gauge-chart';
const WIDGET_ID_BAR_CHART = 'widget-bar-chart';
const WIDGET_ID_SMALL = 'widget-small';
const WIDGET_ID_MEDIUM = 'widget-medium';
const WIDGET_ID_LARGE = 'widget-large';
const WIDGET_ID_WIDE = 'widget-wide';
const WIDGET_ID_TALL = 'widget-tall';
const WIDGET_ID_MANY_TO_ONE_RELATION = 'widget-relation-field';
const WIDGET_ID_ONE_TO_MANY_RELATION = 'widget-one-to-many-relation-field';
const WIDGET_ID_CATALOG = 'catalog-widget';
const TAB_ID_OVERVIEW = 'tab-overview';

const mockPersonRecord: ObjectRecord = {
  __typename: 'Person',
  id: TEST_PERSON_RECORD_ID,
  name: {
    __typename: 'FullName',
    firstName: 'Jane',
    lastName: 'Smith',
  },
};

const mockCompanyRecord: ObjectRecord = {
  __typename: 'Company',
  id: TEST_RECORD_ID,
  name: 'Acme Corporation',
  people: [
    {
      __typename: 'Person',
      id: TEST_PERSON_RECORD_ID,
      name: {
        __typename: 'FullName',
        firstName: 'Jane',
        lastName: 'Smith',
      },
    },
  ],
  accountOwner: {
    __typename: 'WorkspaceMember',
    id: '20202020-0687-4c41-b707-ed1bfca972a7',
    name: {
      __typename: 'FullName',
      firstName: 'John',
      lastName: 'Doe',
    },
    avatarUrl: '',
    userEmail: 'john.doe@acme.com',
    colorScheme: 'Light',
    locale: 'en',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    userId: '20202020-9e3b-46d4-a556-88b9ddc2b034',
  },
};

// Helper function to create a page layout with a widget
const createPageLayoutWithWidget = (
  widget: PageLayoutWidget,
  pageLayoutType: PageLayoutType = PageLayoutType.DASHBOARD,
): PageLayout => ({
  id: PAGE_LAYOUT_TEST_INSTANCE_ID,
  name: 'Mock Page Layout',
  type: pageLayoutType,
  objectMetadataId: companyObjectMetadataItem.id,
  tabs: [
    {
      __typename: 'PageLayoutTab',
      id: TAB_ID_OVERVIEW,
      title: 'Overview',
      position: 0,
      pageLayoutId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      widgets: [widget],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      deletedAt: null,
    },
  ],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  deletedAt: null,
});

const barChartGroupByQuery = generateGroupByAggregateQuery({
  objectMetadataItem: companyObjectMetadataItem,
  aggregateOperationGqlFields: ['totalCount'],
});

const graphqlMocks: MockedResponse[] = [
  {
    request: {
      query: barChartGroupByQuery,
      variables: {
        groupBy: [
          {
            createdAt: {
              granularity: 'DAY',
            },
          },
        ],
      },
    },
    result: {
      data: {
        companiesGroupBy: [
          {
            groupByDimensionValues: ['2024-01-15T00:00:00.000Z'],
            totalCount: 12,
          },
          {
            groupByDimensionValues: ['2024-02-15T00:00:00.000Z'],
            totalCount: 18,
          },
          {
            groupByDimensionValues: ['2024-03-15T00:00:00.000Z'],
            totalCount: 25,
          },
          {
            groupByDimensionValues: ['2024-04-15T00:00:00.000Z'],
            totalCount: 15,
          },
          {
            groupByDimensionValues: ['2024-05-15T00:00:00.000Z'],
            totalCount: 22,
          },
          {
            groupByDimensionValues: ['2024-06-15T00:00:00.000Z'],
            totalCount: 30,
          },
        ],
      },
    },
  },
];

const CoreClientProviderWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const apolloClient = useApolloClient() as ApolloClient<NormalizedCacheObject>;

  return (
    <ApolloCoreClientContext.Provider value={apolloClient}>
      {children}
    </ApolloCoreClientContext.Provider>
  );
};

const JestMetadataAndApolloMocksWrapper = getJestMetadataAndApolloMocksWrapper({
  apolloMocks: graphqlMocks,
});

const meta: Meta<typeof WidgetRenderer> = {
  title: 'Modules/PageLayout/Widgets/WidgetRenderer',
  component: WidgetRenderer,
  decorators: [
    I18nFrontDecorator,
    ChipGeneratorsDecorator,
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof WidgetRenderer>;

export const WithNumberChart: Story = {
  render: () => {
    const widget: PageLayoutWidget = {
      __typename: 'PageLayoutWidget',
      id: WIDGET_ID_NUMBER_CHART,
      pageLayoutTabId: TAB_ID_OVERVIEW,
      type: WidgetType.GRAPH,
      title: 'Sales Pipeline',
      objectMetadataId: companyObjectMetadataItem.id,
      gridPosition: {
        __typename: 'GridPosition',
        row: 0,
        column: 0,
        rowSpan: 2,
        columnSpan: 3,
      },
      configuration: {
        __typename: 'AggregateChartConfiguration',
        configurationType: WidgetConfigurationType.AGGREGATE_CHART,
        aggregateOperation: AggregateOperations.COUNT,
        aggregateFieldMetadataId: idField.id,
        displayDataLabel: true,
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      deletedAt: null,
    };

    const initializeState = (snapshot: MutableSnapshot) => {
      snapshot.set(objectMetadataItemsState, generatedMockObjectMetadataItems);
      snapshot.set(shouldAppBeLoadingState, false);
      const pageLayoutData = createPageLayoutWithWidget(widget);
      snapshot.set(
        pageLayoutPersistedComponentState.atomFamily({
          instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
        }),
        pageLayoutData,
      );
      snapshot.set(
        pageLayoutDraftComponentState.atomFamily({
          instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
        }),
        pageLayoutData,
      );
    };

    return (
      <div style={{ width: '300px', height: '100px' }}>
        <JestMetadataAndApolloMocksWrapper>
          <CoreClientProviderWrapper>
            <PageLayoutTestWrapper initializeState={initializeState}>
              <LayoutRenderingProvider
                value={{
                  isInRightDrawer: false,
                  layoutType: PageLayoutType.DASHBOARD,
                  targetRecordIdentifier: {
                    id: companyObjectMetadataItem.id,
                    targetObjectNameSingular:
                      companyObjectMetadataItem.nameSingular,
                  },
                }}
              >
                <PageLayoutContentProvider
                  value={{
                    layoutMode: 'grid',
                    tabId: TAB_ID_OVERVIEW,
                  }}
                >
                  <WidgetComponentInstanceContext.Provider
                    value={{
                      instanceId: WIDGET_ID_NUMBER_CHART,
                    }}
                  >
                    <WidgetRenderer widget={widget} />
                  </WidgetComponentInstanceContext.Provider>
                </PageLayoutContentProvider>
              </LayoutRenderingProvider>
            </PageLayoutTestWrapper>
          </CoreClientProviderWrapper>
        </JestMetadataAndApolloMocksWrapper>
      </div>
    );
  },
};

export const WithGaugeChart: Story = {
  render: () => {
    const widget: PageLayoutWidget = {
      __typename: 'PageLayoutWidget',
      id: WIDGET_ID_GAUGE_CHART,
      pageLayoutTabId: TAB_ID_OVERVIEW,
      type: WidgetType.GRAPH,
      title: 'Conversion Rate',
      objectMetadataId: companyObjectMetadataItem.id,
      gridPosition: {
        __typename: 'GridPosition',
        row: 0,
        column: 0,
        rowSpan: 5,
        columnSpan: 3,
      },
      configuration: {
        __typename: 'GaugeChartConfiguration',
        configurationType: WidgetConfigurationType.GAUGE_CHART,
        aggregateOperation: AggregateOperations.COUNT,
        aggregateFieldMetadataId: idField.id,
        displayDataLabel: false,
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      deletedAt: null,
    };

    const initializeState = (snapshot: MutableSnapshot) => {
      snapshot.set(objectMetadataItemsState, generatedMockObjectMetadataItems);
      snapshot.set(shouldAppBeLoadingState, false);
      const pageLayoutData = createPageLayoutWithWidget(widget);
      snapshot.set(
        pageLayoutPersistedComponentState.atomFamily({
          instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
        }),
        pageLayoutData,
      );
      snapshot.set(
        pageLayoutDraftComponentState.atomFamily({
          instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
        }),
        pageLayoutData,
      );
    };

    return (
      <div style={{ width: '300px', height: '400px' }}>
        <JestMetadataAndApolloMocksWrapper>
          <CoreClientProviderWrapper>
            <PageLayoutTestWrapper initializeState={initializeState}>
              <LayoutRenderingProvider
                value={{
                  isInRightDrawer: false,
                  layoutType: PageLayoutType.DASHBOARD,
                  targetRecordIdentifier: {
                    id: companyObjectMetadataItem.id,
                    targetObjectNameSingular:
                      companyObjectMetadataItem.nameSingular,
                  },
                }}
              >
                <PageLayoutContentProvider
                  value={{
                    layoutMode: 'grid',
                    tabId: TAB_ID_OVERVIEW,
                  }}
                >
                  <WidgetComponentInstanceContext.Provider
                    value={{
                      instanceId: WIDGET_ID_GAUGE_CHART,
                    }}
                  >
                    <WidgetRenderer widget={widget} />
                  </WidgetComponentInstanceContext.Provider>
                </PageLayoutContentProvider>
              </LayoutRenderingProvider>
            </PageLayoutTestWrapper>
          </CoreClientProviderWrapper>
        </JestMetadataAndApolloMocksWrapper>
      </div>
    );
  },
};

export const WithBarChart: Story = {
  render: () => {
    const widget: PageLayoutWidget = {
      __typename: 'PageLayoutWidget',
      id: WIDGET_ID_BAR_CHART,
      pageLayoutTabId: TAB_ID_OVERVIEW,
      type: WidgetType.GRAPH,
      title: 'Monthly Trends',
      objectMetadataId: companyObjectMetadataItem.id,
      gridPosition: {
        __typename: 'GridPosition',
        row: 0,
        column: 0,
        rowSpan: 5,
        columnSpan: 3,
      },
      configuration: {
        __typename: 'BarChartConfiguration',
        configurationType: WidgetConfigurationType.BAR_CHART,
        layout: BarChartLayout.VERTICAL,
        aggregateOperation: AggregateOperations.COUNT,
        aggregateFieldMetadataId: idField.id,
        primaryAxisGroupByFieldMetadataId: createdAtField.id,
        primaryAxisOrderBy: GraphOrderBy.FIELD_ASC,
        axisNameDisplay: AxisNameDisplay.BOTH,
        displayDataLabel: false,
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      deletedAt: null,
    };

    const initializeState = (snapshot: MutableSnapshot) => {
      snapshot.set(objectMetadataItemsState, generatedMockObjectMetadataItems);
      snapshot.set(shouldAppBeLoadingState, false);
      const pageLayoutData = createPageLayoutWithWidget(widget);
      snapshot.set(
        pageLayoutPersistedComponentState.atomFamily({
          instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
        }),
        pageLayoutData,
      );
      snapshot.set(
        pageLayoutDraftComponentState.atomFamily({
          instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
        }),
        pageLayoutData,
      );
    };

    return (
      <div style={{ width: '300px', height: '500px' }}>
        <JestMetadataAndApolloMocksWrapper>
          <CoreClientProviderWrapper>
            <PageLayoutTestWrapper initializeState={initializeState}>
              <LayoutRenderingProvider
                value={{
                  isInRightDrawer: false,
                  layoutType: PageLayoutType.DASHBOARD,
                  targetRecordIdentifier: {
                    id: companyObjectMetadataItem.id,
                    targetObjectNameSingular:
                      companyObjectMetadataItem.nameSingular,
                  },
                }}
              >
                <PageLayoutContentProvider
                  value={{
                    layoutMode: 'grid',
                    tabId: TAB_ID_OVERVIEW,
                  }}
                >
                  <WidgetComponentInstanceContext.Provider
                    value={{
                      instanceId: WIDGET_ID_BAR_CHART,
                    }}
                  >
                    <WidgetRenderer widget={widget} />
                  </WidgetComponentInstanceContext.Provider>
                </PageLayoutContentProvider>
              </LayoutRenderingProvider>
            </PageLayoutTestWrapper>
          </CoreClientProviderWrapper>
        </JestMetadataAndApolloMocksWrapper>
      </div>
    );
  },
};

export const SmallWidget: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Simulates a 2x2 grid cell widget',
      },
    },
  },
  render: () => {
    const widget: PageLayoutWidget = {
      __typename: 'PageLayoutWidget',
      id: WIDGET_ID_SMALL,
      pageLayoutTabId: TAB_ID_OVERVIEW,
      type: WidgetType.GRAPH,
      title: 'Small Widget (2x2 grid)',
      objectMetadataId: companyObjectMetadataItem.id,
      gridPosition: {
        __typename: 'GridPosition',
        row: 0,
        column: 0,
        rowSpan: 2,
        columnSpan: 2,
      },
      configuration: {
        __typename: 'AggregateChartConfiguration',
        configurationType: WidgetConfigurationType.AGGREGATE_CHART,
        aggregateOperation: AggregateOperations.COUNT,
        aggregateFieldMetadataId: idField.id,
        displayDataLabel: true,
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      deletedAt: null,
    };

    const initializeState = (snapshot: MutableSnapshot) => {
      snapshot.set(objectMetadataItemsState, generatedMockObjectMetadataItems);
      snapshot.set(shouldAppBeLoadingState, false);
      const pageLayoutData = createPageLayoutWithWidget(widget);
      snapshot.set(
        pageLayoutPersistedComponentState.atomFamily({
          instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
        }),
        pageLayoutData,
      );
      snapshot.set(
        pageLayoutDraftComponentState.atomFamily({
          instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
        }),
        pageLayoutData,
      );
    };

    return (
      <div style={{ width: '300px', height: '100px' }}>
        <JestMetadataAndApolloMocksWrapper>
          <CoreClientProviderWrapper>
            <PageLayoutTestWrapper initializeState={initializeState}>
              <LayoutRenderingProvider
                value={{
                  isInRightDrawer: false,
                  layoutType: PageLayoutType.DASHBOARD,
                  targetRecordIdentifier: {
                    id: companyObjectMetadataItem.id,
                    targetObjectNameSingular:
                      companyObjectMetadataItem.nameSingular,
                  },
                }}
              >
                <PageLayoutContentProvider
                  value={{
                    layoutMode: 'grid',
                    tabId: TAB_ID_OVERVIEW,
                  }}
                >
                  <WidgetComponentInstanceContext.Provider
                    value={{
                      instanceId: WIDGET_ID_SMALL,
                    }}
                  >
                    <WidgetRenderer widget={widget} />
                  </WidgetComponentInstanceContext.Provider>
                </PageLayoutContentProvider>
              </LayoutRenderingProvider>
            </PageLayoutTestWrapper>
          </CoreClientProviderWrapper>
        </JestMetadataAndApolloMocksWrapper>
      </div>
    );
  },
};

export const MediumWidget: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Simulates a 4x3 grid cell widget',
      },
    },
  },
  render: () => {
    const widget: PageLayoutWidget = {
      __typename: 'PageLayoutWidget',
      id: WIDGET_ID_MEDIUM,
      pageLayoutTabId: TAB_ID_OVERVIEW,
      type: WidgetType.GRAPH,
      title: 'Medium Widget (4x3 grid)',
      objectMetadataId: companyObjectMetadataItem.id,
      gridPosition: {
        __typename: 'GridPosition',
        row: 0,
        column: 0,
        rowSpan: 3,
        columnSpan: 4,
      },
      configuration: {
        __typename: 'BarChartConfiguration',
        configurationType: WidgetConfigurationType.BAR_CHART,
        layout: BarChartLayout.VERTICAL,
        aggregateOperation: AggregateOperations.COUNT,
        aggregateFieldMetadataId: idField.id,
        primaryAxisGroupByFieldMetadataId: createdAtField.id,
        primaryAxisOrderBy: GraphOrderBy.FIELD_ASC,
        axisNameDisplay: AxisNameDisplay.BOTH,
        displayDataLabel: false,
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      deletedAt: null,
    };

    const initializeState = (snapshot: MutableSnapshot) => {
      snapshot.set(objectMetadataItemsState, generatedMockObjectMetadataItems);
      snapshot.set(shouldAppBeLoadingState, false);
      const pageLayoutData = createPageLayoutWithWidget(widget);
      snapshot.set(
        pageLayoutPersistedComponentState.atomFamily({
          instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
        }),
        pageLayoutData,
      );
      snapshot.set(
        pageLayoutDraftComponentState.atomFamily({
          instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
        }),
        pageLayoutData,
      );
    };

    return (
      <div style={{ width: '400px', height: '250px' }}>
        <JestMetadataAndApolloMocksWrapper>
          <CoreClientProviderWrapper>
            <PageLayoutTestWrapper initializeState={initializeState}>
              <LayoutRenderingProvider
                value={{
                  isInRightDrawer: false,
                  layoutType: PageLayoutType.DASHBOARD,
                  targetRecordIdentifier: {
                    id: companyObjectMetadataItem.id,
                    targetObjectNameSingular:
                      companyObjectMetadataItem.nameSingular,
                  },
                }}
              >
                <PageLayoutContentProvider
                  value={{
                    layoutMode: 'grid',
                    tabId: TAB_ID_OVERVIEW,
                  }}
                >
                  <WidgetComponentInstanceContext.Provider
                    value={{
                      instanceId: WIDGET_ID_MEDIUM,
                    }}
                  >
                    <WidgetRenderer widget={widget} />
                  </WidgetComponentInstanceContext.Provider>
                </PageLayoutContentProvider>
              </LayoutRenderingProvider>
            </PageLayoutTestWrapper>
          </CoreClientProviderWrapper>
        </JestMetadataAndApolloMocksWrapper>
      </div>
    );
  },
};

export const LargeWidget: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Simulates a 6x4 grid cell widget',
      },
    },
  },
  render: () => {
    const widget: PageLayoutWidget = {
      __typename: 'PageLayoutWidget',
      id: WIDGET_ID_LARGE,
      pageLayoutTabId: TAB_ID_OVERVIEW,
      type: WidgetType.GRAPH,
      title: 'Large Widget (6x4 grid)',
      objectMetadataId: companyObjectMetadataItem.id,
      gridPosition: {
        __typename: 'GridPosition',
        row: 0,
        column: 0,
        rowSpan: 4,
        columnSpan: 6,
      },
      configuration: {
        __typename: 'BarChartConfiguration',
        configurationType: WidgetConfigurationType.BAR_CHART,
        layout: BarChartLayout.VERTICAL,
        aggregateOperation: AggregateOperations.COUNT,
        aggregateFieldMetadataId: idField.id,
        primaryAxisGroupByFieldMetadataId: createdAtField.id,
        primaryAxisOrderBy: GraphOrderBy.FIELD_ASC,
        axisNameDisplay: AxisNameDisplay.BOTH,
        displayDataLabel: false,
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      deletedAt: null,
    };

    const initializeState = (snapshot: MutableSnapshot) => {
      snapshot.set(objectMetadataItemsState, generatedMockObjectMetadataItems);
      snapshot.set(shouldAppBeLoadingState, false);
      const pageLayoutData = createPageLayoutWithWidget(widget);
      snapshot.set(
        pageLayoutPersistedComponentState.atomFamily({
          instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
        }),
        pageLayoutData,
      );
      snapshot.set(
        pageLayoutDraftComponentState.atomFamily({
          instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
        }),
        pageLayoutData,
      );
    };

    return (
      <div style={{ width: '600px', height: '400px' }}>
        <JestMetadataAndApolloMocksWrapper>
          <CoreClientProviderWrapper>
            <PageLayoutTestWrapper initializeState={initializeState}>
              <LayoutRenderingProvider
                value={{
                  isInRightDrawer: false,
                  layoutType: PageLayoutType.DASHBOARD,
                  targetRecordIdentifier: {
                    id: companyObjectMetadataItem.id,
                    targetObjectNameSingular:
                      companyObjectMetadataItem.nameSingular,
                  },
                }}
              >
                <PageLayoutContentProvider
                  value={{
                    layoutMode: 'grid',
                    tabId: TAB_ID_OVERVIEW,
                  }}
                >
                  <WidgetComponentInstanceContext.Provider
                    value={{
                      instanceId: WIDGET_ID_LARGE,
                    }}
                  >
                    <WidgetRenderer widget={widget} />
                  </WidgetComponentInstanceContext.Provider>
                </PageLayoutContentProvider>
              </LayoutRenderingProvider>
            </PageLayoutTestWrapper>
          </CoreClientProviderWrapper>
        </JestMetadataAndApolloMocksWrapper>
      </div>
    );
  },
};

export const WideWidget: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Simulates a wide 8x2 grid cell widget',
      },
    },
  },
  render: () => {
    const widget: PageLayoutWidget = {
      __typename: 'PageLayoutWidget',
      id: WIDGET_ID_WIDE,
      pageLayoutTabId: TAB_ID_OVERVIEW,
      type: WidgetType.GRAPH,
      title: 'Wide Widget (8x2 grid)',
      objectMetadataId: companyObjectMetadataItem.id,
      gridPosition: {
        __typename: 'GridPosition',
        row: 0,
        column: 0,
        rowSpan: 2,
        columnSpan: 8,
      },
      configuration: {
        __typename: 'AggregateChartConfiguration',
        configurationType: WidgetConfigurationType.AGGREGATE_CHART,
        aggregateOperation: AggregateOperations.COUNT,
        aggregateFieldMetadataId: idField.id,
        displayDataLabel: true,
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      deletedAt: null,
    };

    const initializeState = (snapshot: MutableSnapshot) => {
      snapshot.set(objectMetadataItemsState, generatedMockObjectMetadataItems);
      snapshot.set(shouldAppBeLoadingState, false);
      const pageLayoutData = createPageLayoutWithWidget(widget);
      snapshot.set(
        pageLayoutPersistedComponentState.atomFamily({
          instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
        }),
        pageLayoutData,
      );
      snapshot.set(
        pageLayoutDraftComponentState.atomFamily({
          instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
        }),
        pageLayoutData,
      );
    };

    return (
      <div style={{ width: '800px', height: '200px' }}>
        <JestMetadataAndApolloMocksWrapper>
          <CoreClientProviderWrapper>
            <PageLayoutTestWrapper initializeState={initializeState}>
              <LayoutRenderingProvider
                value={{
                  isInRightDrawer: false,
                  layoutType: PageLayoutType.DASHBOARD,
                  targetRecordIdentifier: {
                    id: companyObjectMetadataItem.id,
                    targetObjectNameSingular:
                      companyObjectMetadataItem.nameSingular,
                  },
                }}
              >
                <PageLayoutContentProvider
                  value={{
                    layoutMode: 'grid',
                    tabId: TAB_ID_OVERVIEW,
                  }}
                >
                  <WidgetComponentInstanceContext.Provider
                    value={{
                      instanceId: WIDGET_ID_WIDE,
                    }}
                  >
                    <WidgetRenderer widget={widget} />
                  </WidgetComponentInstanceContext.Provider>
                </PageLayoutContentProvider>
              </LayoutRenderingProvider>
            </PageLayoutTestWrapper>
          </CoreClientProviderWrapper>
        </JestMetadataAndApolloMocksWrapper>
      </div>
    );
  },
};

export const TallWidget: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Simulates a tall 3x6 grid cell widget',
      },
    },
  },
  render: () => {
    const widget: PageLayoutWidget = {
      __typename: 'PageLayoutWidget',
      id: WIDGET_ID_TALL,
      pageLayoutTabId: TAB_ID_OVERVIEW,
      type: WidgetType.GRAPH,
      title: 'Tall Widget (3x6 grid)',
      objectMetadataId: companyObjectMetadataItem.id,
      gridPosition: {
        __typename: 'GridPosition',
        row: 0,
        column: 0,
        rowSpan: 6,
        columnSpan: 3,
      },
      configuration: {
        __typename: 'BarChartConfiguration',
        configurationType: WidgetConfigurationType.BAR_CHART,
        layout: BarChartLayout.VERTICAL,
        aggregateOperation: AggregateOperations.COUNT,
        aggregateFieldMetadataId: idField.id,
        primaryAxisGroupByFieldMetadataId: createdAtField.id,
        primaryAxisOrderBy: GraphOrderBy.FIELD_ASC,
        axisNameDisplay: AxisNameDisplay.BOTH,
        displayDataLabel: false,
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      deletedAt: null,
    };

    const initializeState = (snapshot: MutableSnapshot) => {
      snapshot.set(objectMetadataItemsState, generatedMockObjectMetadataItems);
      snapshot.set(shouldAppBeLoadingState, false);
      const pageLayoutData = createPageLayoutWithWidget(widget);
      snapshot.set(
        pageLayoutPersistedComponentState.atomFamily({
          instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
        }),
        pageLayoutData,
      );
      snapshot.set(
        pageLayoutDraftComponentState.atomFamily({
          instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
        }),
        pageLayoutData,
      );
    };

    return (
      <div style={{ width: '300px', height: '500px' }}>
        <JestMetadataAndApolloMocksWrapper>
          <CoreClientProviderWrapper>
            <PageLayoutTestWrapper initializeState={initializeState}>
              <LayoutRenderingProvider
                value={{
                  isInRightDrawer: false,
                  layoutType: PageLayoutType.DASHBOARD,
                  targetRecordIdentifier: {
                    id: companyObjectMetadataItem.id,
                    targetObjectNameSingular:
                      companyObjectMetadataItem.nameSingular,
                  },
                }}
              >
                <PageLayoutContentProvider
                  value={{
                    layoutMode: 'grid',
                    tabId: TAB_ID_OVERVIEW,
                  }}
                >
                  <WidgetComponentInstanceContext.Provider
                    value={{
                      instanceId: WIDGET_ID_TALL,
                    }}
                  >
                    <WidgetRenderer widget={widget} />
                  </WidgetComponentInstanceContext.Provider>
                </PageLayoutContentProvider>
              </LayoutRenderingProvider>
            </PageLayoutTestWrapper>
          </CoreClientProviderWrapper>
        </JestMetadataAndApolloMocksWrapper>
      </div>
    );
  },
};

export const WithManyToOneRelationFieldWidget: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A MANY_TO_ONE relation field widget in readonly mode displaying the Account Owner relation.',
      },
    },
  },
  render: () => {
    const widget: PageLayoutWidget = {
      __typename: 'PageLayoutWidget',
      id: WIDGET_ID_MANY_TO_ONE_RELATION,
      pageLayoutTabId: TAB_ID_OVERVIEW,
      type: WidgetType.FIELD,
      title: 'Account Owner',
      objectMetadataId: companyObjectMetadataItem.id,
      gridPosition: {
        __typename: 'GridPosition',
        row: 0,
        column: 0,
        rowSpan: 1,
        columnSpan: 2,
      },
      configuration: {
        __typename: 'FieldConfiguration',
        configurationType: WidgetConfigurationType.FIELD,
        fieldMetadataId: accountOwnerField.id,
        layout: 'FIELD',
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      deletedAt: null,
    };

    const initializeState = (snapshot: MutableSnapshot) => {
      snapshot.set(objectMetadataItemsState, generatedMockObjectMetadataItems);
      snapshot.set(shouldAppBeLoadingState, false);
      const pageLayoutData = createPageLayoutWithWidget(
        widget,
        PageLayoutType.RECORD_PAGE,
      );
      snapshot.set(
        pageLayoutPersistedComponentState.atomFamily({
          instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
        }),
        pageLayoutData,
      );
      snapshot.set(
        pageLayoutDraftComponentState.atomFamily({
          instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
        }),
        pageLayoutData,
      );
      snapshot.set(
        isPageLayoutInEditModeComponentState.atomFamily({
          instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
        }),
        false,
      );
      snapshot.set(recordStoreFamilyState(TEST_RECORD_ID), mockCompanyRecord);
      // Set the related WorkspaceMember record for relation field display
      if (
        mockCompanyRecord.accountOwner !== null &&
        mockCompanyRecord.accountOwner !== undefined
      ) {
        snapshot.set(
          recordStoreFamilyState(
            (mockCompanyRecord.accountOwner as ObjectRecord).id,
          ),
          mockCompanyRecord.accountOwner,
        );
      }
    };

    return (
      <div style={{ width: '400px', padding: '20px' }}>
        <JestMetadataAndApolloMocksWrapper>
          <CoreClientProviderWrapper>
            <PageLayoutTestWrapper initializeState={initializeState}>
              <LayoutRenderingProvider
                value={{
                  isInRightDrawer: false,
                  layoutType: PageLayoutType.RECORD_PAGE,
                  targetRecordIdentifier: {
                    id: TEST_RECORD_ID,
                    targetObjectNameSingular:
                      companyObjectMetadataItem.nameSingular,
                  },
                }}
              >
                <PageLayoutContentProvider
                  value={{
                    layoutMode: 'vertical-list',
                    tabId: TAB_ID_OVERVIEW,
                  }}
                >
                  <WidgetComponentInstanceContext.Provider
                    value={{
                      instanceId: WIDGET_ID_MANY_TO_ONE_RELATION,
                    }}
                  >
                    <WidgetRenderer widget={widget} />
                  </WidgetComponentInstanceContext.Provider>
                </PageLayoutContentProvider>
              </LayoutRenderingProvider>
            </PageLayoutTestWrapper>
          </CoreClientProviderWrapper>
        </JestMetadataAndApolloMocksWrapper>
      </div>
    );
  },
};

export const WithOneToManyRelationFieldWidget: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A ONE_TO_MANY relation field widget in readonly mode displaying the People relation.',
      },
    },
  },
  render: () => {
    const widget: PageLayoutWidget = {
      __typename: 'PageLayoutWidget',
      id: WIDGET_ID_ONE_TO_MANY_RELATION,
      pageLayoutTabId: TAB_ID_OVERVIEW,
      type: WidgetType.FIELD,
      title: 'People',
      objectMetadataId: companyObjectMetadataItem.id,
      gridPosition: {
        __typename: 'GridPosition',
        row: 0,
        column: 0,
        rowSpan: 1,
        columnSpan: 2,
      },
      configuration: {
        __typename: 'FieldConfiguration',
        configurationType: WidgetConfigurationType.FIELD,
        fieldMetadataId: companyPeopleField.id,
        layout: 'FIELD',
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      deletedAt: null,
    };

    const initializeState = (snapshot: MutableSnapshot) => {
      snapshot.set(objectMetadataItemsState, generatedMockObjectMetadataItems);
      snapshot.set(shouldAppBeLoadingState, false);
      const pageLayoutData = createPageLayoutWithWidget(
        widget,
        PageLayoutType.RECORD_PAGE,
      );
      snapshot.set(
        pageLayoutPersistedComponentState.atomFamily({
          instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
        }),
        pageLayoutData,
      );
      snapshot.set(
        pageLayoutDraftComponentState.atomFamily({
          instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
        }),
        pageLayoutData,
      );
      snapshot.set(
        isPageLayoutInEditModeComponentState.atomFamily({
          instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
        }),
        false,
      );
      snapshot.set(recordStoreFamilyState(TEST_RECORD_ID), mockCompanyRecord);
      snapshot.set(
        recordStoreFamilyState(TEST_PERSON_RECORD_ID),
        mockPersonRecord,
      );
    };

    return (
      <div style={{ width: '400px', padding: '20px' }}>
        <JestMetadataAndApolloMocksWrapper>
          <CoreClientProviderWrapper>
            <PageLayoutTestWrapper initializeState={initializeState}>
              <LayoutRenderingProvider
                value={{
                  isInRightDrawer: false,
                  layoutType: PageLayoutType.RECORD_PAGE,
                  targetRecordIdentifier: {
                    id: TEST_RECORD_ID,
                    targetObjectNameSingular:
                      companyObjectMetadataItem.nameSingular,
                  },
                }}
              >
                <PageLayoutContentProvider
                  value={{
                    layoutMode: 'vertical-list',
                    tabId: TAB_ID_OVERVIEW,
                  }}
                >
                  <WidgetComponentInstanceContext.Provider
                    value={{
                      instanceId: WIDGET_ID_ONE_TO_MANY_RELATION,
                    }}
                  >
                    <WidgetRenderer widget={widget} />
                  </WidgetComponentInstanceContext.Provider>
                </PageLayoutContentProvider>
              </LayoutRenderingProvider>
            </PageLayoutTestWrapper>
          </CoreClientProviderWrapper>
        </JestMetadataAndApolloMocksWrapper>
      </div>
    );
  },
};

export const OnMobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story:
          'Widget on mobile viewport should use side-column variant instead of record-page variant.',
      },
    },
  },
  render: () => {
    const widget: PageLayoutWidget = {
      __typename: 'PageLayoutWidget',
      id: 'widget-mobile',
      pageLayoutTabId: TAB_ID_OVERVIEW,
      type: WidgetType.GRAPH,
      title: 'Mobile Widget',
      objectMetadataId: companyObjectMetadataItem.id,
      gridPosition: {
        __typename: 'GridPosition',
        row: 0,
        column: 0,
        rowSpan: 2,
        columnSpan: 3,
      },
      configuration: {
        __typename: 'AggregateChartConfiguration',
        configurationType: WidgetConfigurationType.AGGREGATE_CHART,
        aggregateOperation: AggregateOperations.COUNT,
        aggregateFieldMetadataId: idField.id,
        displayDataLabel: true,
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      deletedAt: null,
    };

    const initializeState = (snapshot: MutableSnapshot) => {
      snapshot.set(objectMetadataItemsState, generatedMockObjectMetadataItems);
      snapshot.set(shouldAppBeLoadingState, false);
      const pageLayoutData = createPageLayoutWithWidget(
        widget,
        PageLayoutType.RECORD_PAGE,
      );
      snapshot.set(
        pageLayoutPersistedComponentState.atomFamily({
          instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
        }),
        pageLayoutData,
      );
      snapshot.set(
        pageLayoutDraftComponentState.atomFamily({
          instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
        }),
        pageLayoutData,
      );
    };

    return (
      <div style={{ width: '100%', padding: '20px' }}>
        <JestMetadataAndApolloMocksWrapper>
          <CoreClientProviderWrapper>
            <PageLayoutTestWrapper initializeState={initializeState}>
              <LayoutRenderingProvider
                value={{
                  isInRightDrawer: false,
                  layoutType: PageLayoutType.RECORD_PAGE,
                  targetRecordIdentifier: {
                    id: TEST_RECORD_ID,
                    targetObjectNameSingular:
                      companyObjectMetadataItem.nameSingular,
                  },
                }}
              >
                <PageLayoutContentProvider
                  value={{
                    layoutMode: 'grid',
                    tabId: TAB_ID_OVERVIEW,
                  }}
                >
                  <WidgetComponentInstanceContext.Provider
                    value={{
                      instanceId: 'widget-mobile',
                    }}
                  >
                    <WidgetRenderer widget={widget} />
                  </WidgetComponentInstanceContext.Provider>
                </PageLayoutContentProvider>
              </LayoutRenderingProvider>
            </PageLayoutTestWrapper>
          </CoreClientProviderWrapper>
        </JestMetadataAndApolloMocksWrapper>
      </div>
    );
  },
};

export const InSidePanel: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Widget in side panel (right drawer) should use side-column variant instead of record-page variant.',
      },
    },
  },
  render: () => {
    const widget: PageLayoutWidget = {
      __typename: 'PageLayoutWidget',
      id: 'widget-side-panel',
      pageLayoutTabId: TAB_ID_OVERVIEW,
      type: WidgetType.GRAPH,
      title: 'Side Panel Widget',
      objectMetadataId: companyObjectMetadataItem.id,
      gridPosition: {
        __typename: 'GridPosition',
        row: 0,
        column: 0,
        rowSpan: 2,
        columnSpan: 3,
      },
      configuration: {
        __typename: 'AggregateChartConfiguration',
        configurationType: WidgetConfigurationType.AGGREGATE_CHART,
        aggregateOperation: AggregateOperations.COUNT,
        aggregateFieldMetadataId: idField.id,
        displayDataLabel: true,
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      deletedAt: null,
    };

    const initializeState = (snapshot: MutableSnapshot) => {
      snapshot.set(objectMetadataItemsState, generatedMockObjectMetadataItems);
      snapshot.set(shouldAppBeLoadingState, false);
      const pageLayoutData = createPageLayoutWithWidget(
        widget,
        PageLayoutType.RECORD_PAGE,
      );
      snapshot.set(
        pageLayoutPersistedComponentState.atomFamily({
          instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
        }),
        pageLayoutData,
      );
      snapshot.set(
        pageLayoutDraftComponentState.atomFamily({
          instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
        }),
        pageLayoutData,
      );
    };

    return (
      <div style={{ width: '400px', padding: '20px' }}>
        <JestMetadataAndApolloMocksWrapper>
          <CoreClientProviderWrapper>
            <PageLayoutTestWrapper initializeState={initializeState}>
              <LayoutRenderingProvider
                value={{
                  isInRightDrawer: true,
                  layoutType: PageLayoutType.RECORD_PAGE,
                  targetRecordIdentifier: {
                    id: TEST_RECORD_ID,
                    targetObjectNameSingular:
                      companyObjectMetadataItem.nameSingular,
                  },
                }}
              >
                <PageLayoutContentProvider
                  value={{
                    layoutMode: 'grid',
                    tabId: TAB_ID_OVERVIEW,
                  }}
                >
                  <WidgetComponentInstanceContext.Provider
                    value={{
                      instanceId: 'widget-side-panel',
                    }}
                  >
                    <WidgetRenderer widget={widget} />
                  </WidgetComponentInstanceContext.Provider>
                </PageLayoutContentProvider>
              </LayoutRenderingProvider>
            </PageLayoutTestWrapper>
          </CoreClientProviderWrapper>
        </JestMetadataAndApolloMocksWrapper>
      </div>
    );
  },
};

export const Catalog: CatalogStory<Story, typeof WidgetRenderer> = {
  parameters: {
    catalog: {
      dimensions: [
        {
          name: 'state',
          values: ['default', 'hover', 'selected', 'dragging', 'read'],
          props: (state: string) => ({ catalogState: state }) as any,
          labels: (state: string) => {
            const labelMap: Record<string, string> = {
              default: 'Default',
              hover: 'Hover',
              selected: 'Selected',
              dragging: 'Dragging',
              read: 'Read',
            };
            return labelMap[state] ?? state;
          },
        },
        {
          name: 'variant',
          values: [
            'record-page',
            'side-column',
            'record-page-restricted',
            'dashboard',
            'dashboard-restricted',
          ],
          props: (variant: string) => ({ catalogVariant: variant }) as any,
          labels: (variant: string) => {
            const labelMap: Record<string, string> = {
              'record-page': 'Record page > Default',
              'side-column': 'Record page > Side column',
              'record-page-restricted': 'Record page - content restriction',
              dashboard: 'Dashboard',
              'dashboard-restricted': 'Dashboard - content restriction',
            };
            return labelMap[variant] ?? variant;
          },
        },
      ],
      options: {
        elementContainer: {
          width: 300,
        },
      },
    },
    pseudo: {
      hover: ['.hover-state *'],
    },
  },
  render: (args) => {
    const state = (args as any).catalogState || 'default';
    const variantKey = (args as any).catalogVariant || 'record-page';

    const isRestricted = variantKey.includes('-restricted');
    const variant = variantKey.replace('-restricted', '') as WidgetCardVariant;

    const isInEditMode = state !== 'read';

    const pageLayoutType =
      variant === 'dashboard'
        ? PageLayoutType.DASHBOARD
        : PageLayoutType.RECORD_PAGE;

    const layoutMode =
      variant === 'canvas'
        ? ('canvas' as const)
        : variant === 'side-column'
          ? ('grid' as const)
          : ('grid' as const);

    const widget: PageLayoutWidget = {
      __typename: 'PageLayoutWidget',
      id: WIDGET_ID_CATALOG,
      pageLayoutTabId:
        variant === 'side-column' ? 'pinned-tab' : TAB_ID_OVERVIEW,
      type: WidgetType.GRAPH,
      title: 'Widget name',
      objectMetadataId: companyObjectMetadataItem.id,
      gridPosition: {
        __typename: 'GridPosition',
        row: 0,
        column: 0,
        rowSpan: 2,
        columnSpan: 3,
      },
      configuration: {
        __typename: 'AggregateChartConfiguration',
        configurationType: WidgetConfigurationType.AGGREGATE_CHART,
        aggregateOperation: AggregateOperations.COUNT,
        aggregateFieldMetadataId: idField.id,
        displayDataLabel: true,
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      deletedAt: null,
    };

    const initializeState = (snapshot: MutableSnapshot) => {
      snapshot.set(objectMetadataItemsState, generatedMockObjectMetadataItems);
      snapshot.set(shouldAppBeLoadingState, false);

      if (state === 'hover') {
        snapshot.set(
          widgetCardHoveredComponentFamilyState.atomFamily({
            instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
            familyKey: widget.id,
          }),
          true,
        );
      }

      if (state === 'selected') {
        snapshot.set(
          pageLayoutEditingWidgetIdComponentState.atomFamily({
            instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
          }),
          widget.id,
        );
      }

      if (state === 'dragging') {
        snapshot.set(
          pageLayoutDraggingWidgetIdComponentState.atomFamily({
            instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
          }),
          widget.id,
        );
      }

      if (isRestricted === true) {
        snapshot.set(currentUserWorkspaceState, {
          permissionFlags: [],
          twoFactorAuthenticationMethodSummary: null,
          objectsPermissions: [
            {
              objectMetadataId: companyObjectMetadataItem.id,
              canReadObjectRecords: false,
              canUpdateObjectRecords: false,
              canSoftDeleteObjectRecords: false,
              canDestroyObjectRecords: false,
              restrictedFields: {},
            },
          ],
        });
      } else {
        snapshot.set(currentUserWorkspaceState, {
          permissionFlags: [],
          twoFactorAuthenticationMethodSummary: null,
          objectsPermissions: [
            {
              objectMetadataId: companyObjectMetadataItem.id,
              canReadObjectRecords: true,
              canUpdateObjectRecords: true,
              canSoftDeleteObjectRecords: true,
              canDestroyObjectRecords: true,
              restrictedFields: {},
            },
          ],
        });
      }

      const pageLayoutData: PageLayout = {
        id: PAGE_LAYOUT_TEST_INSTANCE_ID,
        name: 'Mock Page Layout',
        type: pageLayoutType,
        objectMetadataId: companyObjectMetadataItem.id,
        tabs:
          variant === 'side-column'
            ? [
                {
                  __typename: 'PageLayoutTab',
                  id: 'pinned-tab',
                  title: 'Pinned Tab',
                  position: 0,
                  pageLayoutId: PAGE_LAYOUT_TEST_INSTANCE_ID,
                  widgets: [widget],
                  createdAt: '2024-01-01T00:00:00Z',
                  updatedAt: '2024-01-01T00:00:00Z',
                  deletedAt: null,
                },
                {
                  __typename: 'PageLayoutTab',
                  id: 'other-tab',
                  title: 'Other Tab',
                  position: 1,
                  pageLayoutId: PAGE_LAYOUT_TEST_INSTANCE_ID,
                  widgets: [],
                  createdAt: '2024-01-01T00:00:00Z',
                  updatedAt: '2024-01-01T00:00:00Z',
                  deletedAt: null,
                },
              ]
            : [
                {
                  __typename: 'PageLayoutTab',
                  id: TAB_ID_OVERVIEW,
                  title: 'Overview',
                  position: 0,
                  pageLayoutId: PAGE_LAYOUT_TEST_INSTANCE_ID,
                  widgets: [widget],
                  createdAt: '2024-01-01T00:00:00Z',
                  updatedAt: '2024-01-01T00:00:00Z',
                  deletedAt: null,
                },
              ],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        deletedAt: null,
      };

      snapshot.set(
        pageLayoutPersistedComponentState.atomFamily({
          instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
        }),
        pageLayoutData,
      );
      snapshot.set(
        pageLayoutDraftComponentState.atomFamily({
          instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
        }),
        pageLayoutData,
      );
      snapshot.set(
        isPageLayoutInEditModeComponentState.atomFamily({
          instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
        }),
        isInEditMode,
      );
    };

    const containerClassName = state === 'hover' ? 'hover-state' : '';

    return (
      <div
        style={{ width: '300px', height: '200px' }}
        className={containerClassName}
      >
        <JestMetadataAndApolloMocksWrapper>
          <CoreClientProviderWrapper>
            <PageLayoutTestWrapper initializeState={initializeState}>
              <LayoutRenderingProvider
                value={{
                  isInRightDrawer: false,
                  layoutType: pageLayoutType,
                  targetRecordIdentifier: {
                    id: companyObjectMetadataItem.id,
                    targetObjectNameSingular:
                      companyObjectMetadataItem.nameSingular,
                  },
                }}
              >
                <PageLayoutContentProvider
                  value={{
                    layoutMode,
                    tabId:
                      variant === 'side-column'
                        ? 'pinned-tab'
                        : TAB_ID_OVERVIEW,
                  }}
                >
                  <WidgetComponentInstanceContext.Provider
                    value={{
                      instanceId: WIDGET_ID_CATALOG,
                    }}
                  >
                    <WidgetRenderer widget={widget} />
                  </WidgetComponentInstanceContext.Provider>
                </PageLayoutContentProvider>
              </LayoutRenderingProvider>
            </PageLayoutTestWrapper>
          </CoreClientProviderWrapper>
        </JestMetadataAndApolloMocksWrapper>
      </div>
    );
  },
  decorators: [CatalogDecorator],
};
