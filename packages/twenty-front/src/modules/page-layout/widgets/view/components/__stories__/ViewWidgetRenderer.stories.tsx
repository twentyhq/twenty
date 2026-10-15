import { type Meta, type StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { expect, within } from 'storybook/test';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { isMinimalMetadataReadyState } from '@/metadata-store/states/isMinimalMetadataReadyState';
import { PageLayoutContentProvider } from '@/page-layout/contexts/PageLayoutContentContext';
import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { ViewWidgetRenderer } from '@/page-layout/widgets/view/components/ViewWidgetRenderer';
import { LayoutRenderingProvider } from '@/ui/layout/contexts/LayoutRenderingContext';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import {
  PageLayoutTabLayoutMode,
  PageLayoutType,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';
import { ChipGeneratorsDecorator } from '~/testing/decorators/ChipGeneratorsDecorator';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { mockedViews } from '~/testing/mock-data/generated/metadata/views/mock-views-data';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';
import { setTestObjectMetadataItemsInMetadataStore } from '~/testing/utils/setTestObjectMetadataItemsInMetadataStore';
import { setTestViewsInMetadataStore } from '~/testing/utils/setTestViewsInMetadataStore';

const WIDGET_ID = 'view-widget';
const TAB_ID = 'tab-overview';
const DELETED_VIEW_ID = '20202020-dead-4000-8000-000000000000';

const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow(
  CoreObjectNameSingular.Company,
);

const companyView = mockedViews.find(
  (view) =>
    view.objectMetadataId === companyObjectMetadataItem.id &&
    view.key === 'INDEX',
);

if (!isDefined(companyView)) {
  throw new Error('Missing mocked company index view');
}

const buildViewWidget = (viewId: string | null): PageLayoutWidget => ({
  __typename: 'PageLayoutWidget',
  id: WIDGET_ID,
  applicationId: '',
  universalIdentifier: 'universal-identifier-mock',
  isSystemSideEffect: false,
  isActive: true,
  pageLayoutTabId: TAB_ID,
  type: WidgetType.VIEW,
  title: 'Companies',
  objectMetadataId: companyObjectMetadataItem.id,
  position: {
    __typename: 'PageLayoutWidgetGridPosition',
    layoutMode: PageLayoutTabLayoutMode.GRID,
    row: 0,
    column: 0,
    rowSpan: 6,
    columnSpan: 6,
  },
  configuration: {
    __typename: 'ViewConfiguration',
    configurationType: WidgetConfigurationType.VIEW,
    viewId,
  },
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  deletedAt: null,
});

const buildPageLayout = (widget: PageLayoutWidget): PageLayout => ({
  id: PAGE_LAYOUT_TEST_INSTANCE_ID,
  applicationId: 'application-id-mock',
  universalIdentifier: '20202020-0000-0000-0000-000000000001',
  name: 'Mock Dashboard',
  type: PageLayoutType.DASHBOARD,
  isSystemSideEffect: false,
  isFirstTabPinned: true,
  objectMetadataId: null,
  tabs: [
    {
      __typename: 'PageLayoutTab',
      id: TAB_ID,
      applicationId: '',
      universalIdentifier: 'universal-identifier-mock',
      isSystemSideEffect: false,
      isActive: true,
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

const JestMetadataAndApolloMocksWrapper = getJestMetadataAndApolloMocksWrapper({
  apolloMocks: [],
});

const ViewWidgetRendererStory = ({ viewId }: { viewId: string | null }) => {
  const widget = buildViewWidget(viewId);
  const pageLayout = buildPageLayout(widget);

  setTestObjectMetadataItemsInMetadataStore(
    jotaiStore,
    getTestEnrichedObjectMetadataItemsMock(),
  );
  setTestViewsInMetadataStore(jotaiStore, mockedViews);
  jotaiStore.set(isMinimalMetadataReadyState.atom, true);
  jotaiStore.set(
    pageLayoutPersistedComponentState.atomFamily({
      instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
    }),
    pageLayout,
  );
  jotaiStore.set(
    pageLayoutDraftComponentState.atomFamily({
      instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
    }),
    pageLayout,
  );

  return (
    <div style={{ width: '600px', height: '400px' }}>
      <JestMetadataAndApolloMocksWrapper>
        <PageLayoutTestWrapper store={jotaiStore}>
          <LayoutRenderingProvider
            value={{
              layoutType: PageLayoutType.DASHBOARD,
              targetRecordIdentifier: undefined,
            }}
          >
            <PageLayoutContentProvider
              value={{
                layoutMode: PageLayoutTabLayoutMode.GRID,
                presentation: 'stack',
                tabId: TAB_ID,
              }}
            >
              <WidgetComponentInstanceContext.Provider
                value={{ instanceId: WIDGET_ID }}
              >
                <ViewWidgetRenderer widget={widget} />
              </WidgetComponentInstanceContext.Provider>
            </PageLayoutContentProvider>
          </LayoutRenderingProvider>
        </PageLayoutTestWrapper>
      </JestMetadataAndApolloMocksWrapper>
    </div>
  );
};

const meta: Meta<typeof ViewWidgetRendererStory> = {
  title: 'Modules/PageLayout/Widgets/ViewWidgetRenderer',
  component: ViewWidgetRendererStory,
  decorators: [
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
type Story = StoryObj<typeof ViewWidgetRendererStory>;

export const WithSelectedView: Story = {
  args: { viewId: companyView.id },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(canvas.queryByText('View unavailable')).not.toBeInTheDocument();
    expect(canvas.queryByText('No view selected')).not.toBeInTheDocument();
  },
};

export const WithDeletedView: Story = {
  args: { viewId: DELETED_VIEW_ID },
  play: async ({ canvasElement }) => {
    expect(
      await within(canvasElement).findByText('View unavailable'),
    ).toBeVisible();
  },
};

export const WithoutView: Story = {
  args: { viewId: null },
  play: async ({ canvasElement }) => {
    expect(
      await within(canvasElement).findByText('No view selected'),
    ).toBeVisible();
  },
};
