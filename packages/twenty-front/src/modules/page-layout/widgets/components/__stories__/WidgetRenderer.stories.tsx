import {
  type ApolloClient,
  type NormalizedCacheObject,
  useApolloClient,
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
import { PageLayoutContentProvider } from '@/page-layout/contexts/PageLayoutContentContext';
import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { isPageLayoutInEditModeComponentState } from '@/page-layout/states/isPageLayoutInEditModeComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { WidgetRenderer } from '@/page-layout/widgets/components/WidgetRenderer';
import { generateGroupByQuery } from '@/page-layout/widgets/graph/utils/generateGroupByQuery';
import { type WidgetCardVariant } from '@/page-layout/widgets/types/WidgetCardVariant';
import { LayoutRenderingProvider } from '@/ui/layout/contexts/LayoutRenderingContext';
import {
  GraphOrderBy,
  GraphType,
  WidgetType,
} from '~/generated-metadata/graphql';
import {
  AggregateOperations,
  AxisNameDisplay,
  PageLayoutType,
  type PageLayoutWidget,
} from '~/generated/graphql';
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

const barChartGroupByQuery = generateGroupByQuery({
  objectMetadataItem: companyObjectMetadataItem,
  aggregateOperations: ['totalCount'],
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
    (Story) => {
      const initializeState = (snapshot: MutableSnapshot) => {
        snapshot.set(
          objectMetadataItemsState,
          generatedMockObjectMetadataItems,
        );
        snapshot.set(shouldAppBeLoadingState, false);
        snapshot.set(
          pageLayoutPersistedComponentState.atomFamily({
            instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
          }),
          {
            id: PAGE_LAYOUT_TEST_INSTANCE_ID,
            name: 'Mock Page Layout',
            type: PageLayoutType.DASHBOARD,
            objectMetadataId: companyObjectMetadataItem.id,
            tabs: [],
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            deletedAt: null,
          },
        );
      };

      return (
        <MemoryRouter>
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
                      tabId: 'fields',
                    }}
                  >
                    <Story />
                  </PageLayoutContentProvider>
                </LayoutRenderingProvider>
              </PageLayoutTestWrapper>
            </CoreClientProviderWrapper>
          </JestMetadataAndApolloMocksWrapper>
        </MemoryRouter>
      );
    },
  ],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    widget: {
      control: 'object',
      description: 'Widget',
    },
  },
};

export default meta;
type Story = StoryObj<typeof WidgetRenderer>;

export const WithNumberChart: Story = {
  args: {
    widget: {
      __typename: 'PageLayoutWidget',
      id: 'widget-1',
      pageLayoutTabId: 'tab-overview',
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
        graphType: GraphType.AGGREGATE,
        aggregateOperation: AggregateOperations.COUNT,
        aggregateFieldMetadataId: idField.id,
        displayDataLabel: true,
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      deletedAt: null,
    } as PageLayoutWidget,
  },
  render: (args) => (
    <div style={{ width: '300px', height: '100px' }}>
      <WidgetRenderer widget={args.widget} />
    </div>
  ),
};

export const WithGaugeChart: Story = {
  args: {
    widget: {
      __typename: 'PageLayoutWidget',
      id: 'widget-2',
      pageLayoutTabId: 'tab-overview',
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
        graphType: GraphType.GAUGE,
        aggregateOperation: AggregateOperations.COUNT,
        aggregateFieldMetadataId: idField.id,
        displayDataLabel: false,
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      deletedAt: null,
    } as PageLayoutWidget,
  },
  render: (args) => (
    <div style={{ width: '300px', height: '400px' }}>
      <WidgetRenderer widget={args.widget} />
    </div>
  ),
};

export const WithBarChart: Story = {
  args: {
    widget: {
      __typename: 'PageLayoutWidget',
      id: 'widget-3',
      pageLayoutTabId: 'tab-overview',
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
        graphType: GraphType.VERTICAL_BAR,
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
    } as PageLayoutWidget,
  },
  render: (args) => (
    <div style={{ width: '300px', height: '500px' }}>
      <WidgetRenderer widget={args.widget} />
    </div>
  ),
};

export const SmallWidget: Story = {
  args: {
    widget: {
      __typename: 'PageLayoutWidget',
      id: 'widget-4',
      pageLayoutTabId: 'tab-overview',
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
        graphType: GraphType.AGGREGATE,
        aggregateOperation: AggregateOperations.COUNT,
        aggregateFieldMetadataId: idField.id,
        displayDataLabel: true,
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      deletedAt: null,
    } as PageLayoutWidget,
  },
  parameters: {
    docs: {
      description: {
        story: 'Simulates a 2x2 grid cell widget',
      },
    },
  },
  render: (args) => (
    <div style={{ width: '300px', height: '100px' }}>
      <WidgetRenderer widget={args.widget} />
    </div>
  ),
};

export const MediumWidget: Story = {
  args: {
    widget: {
      __typename: 'PageLayoutWidget',
      id: 'widget-5',
      pageLayoutTabId: 'tab-overview',
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
        graphType: GraphType.VERTICAL_BAR,
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
    } as PageLayoutWidget,
  },
  parameters: {
    docs: {
      description: {
        story: 'Simulates a 4x3 grid cell widget',
      },
    },
  },
  render: (args) => (
    <div style={{ width: '400px', height: '250px' }}>
      <WidgetRenderer widget={args.widget} />
    </div>
  ),
};

export const LargeWidget: Story = {
  args: {
    widget: {
      __typename: 'PageLayoutWidget',
      id: 'widget-6',
      pageLayoutTabId: 'tab-overview',
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
        graphType: GraphType.VERTICAL_BAR,
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
    } as PageLayoutWidget,
  },
  parameters: {
    docs: {
      description: {
        story: 'Simulates a 6x4 grid cell widget',
      },
    },
  },
  render: (args) => (
    <div style={{ width: '600px', height: '400px' }}>
      <WidgetRenderer widget={args.widget} />
    </div>
  ),
};

export const WideWidget: Story = {
  args: {
    widget: {
      __typename: 'PageLayoutWidget',
      id: 'widget-7',
      pageLayoutTabId: 'tab-overview',
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
        graphType: GraphType.AGGREGATE,
        aggregateOperation: AggregateOperations.COUNT,
        aggregateFieldMetadataId: idField.id,
        displayDataLabel: true,
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      deletedAt: null,
    } as PageLayoutWidget,
  },
  parameters: {
    docs: {
      description: {
        story: 'Simulates a wide 8x2 grid cell widget',
      },
    },
  },
  render: (args) => (
    <div style={{ width: '800px', height: '200px' }}>
      <WidgetRenderer widget={args.widget} />
    </div>
  ),
};

export const TallWidget: Story = {
  args: {
    widget: {
      __typename: 'PageLayoutWidget',
      id: 'widget-8',
      pageLayoutTabId: 'tab-overview',
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
        graphType: GraphType.VERTICAL_BAR,
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
    } as PageLayoutWidget,
  },
  parameters: {
    docs: {
      description: {
        story: 'Simulates a tall 3x6 grid cell widget',
      },
    },
  },
  render: (args) => (
    <div style={{ width: '300px', height: '500px' }}>
      <WidgetRenderer widget={args.widget} />
    </div>
  ),
};

export const Catalog: CatalogStory<Story, typeof WidgetRenderer> = {
  args: {
    widget: {
      __typename: 'PageLayoutWidget',
      id: 'catalog-widget',
      pageLayoutTabId: 'tab-overview',
      type: WidgetType.GRAPH,
      title: 'Widget',
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
        graphType: GraphType.AGGREGATE,
        aggregateOperation: AggregateOperations.COUNT,
        aggregateFieldMetadataId: idField.id,
        displayDataLabel: true,
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      deletedAt: null,
    } as PageLayoutWidget,
  },
  parameters: {
    catalog: {
      dimensions: [
        {
          name: 'variant',
          values: [
            'record-page',
            'side-column',
            'canvas',
            'dashboard',
          ] satisfies WidgetCardVariant[],
          props: (variant: string) => ({ catalogVariant: variant }) as any,
          labels: (variant: string) => {
            const labelMap: Record<string, string> = {
              'record-page': 'Record Page',
              'side-column': 'Side Column',
              canvas: 'Canvas',
              dashboard: 'Dashboard',
            };
            return labelMap[variant] ?? variant;
          },
        },
        {
          name: 'mode',
          values: ['edit', 'read'],
          props: (mode: string) => ({ catalogMode: mode }) as any,
          labels: (mode: string) =>
            mode === 'edit' ? 'Edit Mode' : 'Read Mode',
        },
        {
          name: 'permission',
          values: ['allowed', 'restricted'],
          props: (permission: string) =>
            ({ catalogPermission: permission }) as any,
          labels: (permission: string) =>
            permission === 'allowed' ? 'Allowed' : 'Restricted',
        },
      ],
      options: {
        elementContainer: {
          width: 300,
        },
      },
    },
  },
  render: (args) => {
    const variant = (args as any).catalogVariant || 'record-page';
    const mode = (args as any).catalogMode || 'edit';
    const permission = (args as any).catalogPermission || 'allowed';

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

    const isInEditMode = mode === 'edit';

    const initializeState = (snapshot: MutableSnapshot) => {
      snapshot.set(objectMetadataItemsState, generatedMockObjectMetadataItems);
      snapshot.set(shouldAppBeLoadingState, false);

      if (permission === 'restricted') {
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
                  widgets: [args.widget],
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
                  widgets: [args.widget],
                  createdAt: '2024-01-01T00:00:00Z',
                  updatedAt: '2024-01-01T00:00:00Z',
                  deletedAt: null,
                },
              ]
            : [],
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

    return (
      <div style={{ width: '300px', height: '200px' }}>
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
                    tabId: variant === 'side-column' ? 'pinned-tab' : 'fields',
                  }}
                >
                  <WidgetRenderer widget={args.widget} />
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
