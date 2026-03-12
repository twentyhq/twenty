import {
  type ApolloClient,
  type NormalizedCacheObject,
  useApolloClient,
} from '@apollo/client';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { expect, waitFor, within } from 'storybook/test';

import { isAppMetadataReadyState } from '@/metadata-store/states/isAppMetadataReadyState';
import { ApolloCoreClientContext } from '@/object-metadata/contexts/ApolloCoreClientContext';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { PageLayoutContentProvider } from '@/page-layout/contexts/PageLayoutContentContext';
import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { FieldsWidget } from '@/page-layout/widgets/fields/components/FieldsWidget';
import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { LayoutRenderingProvider } from '@/ui/layout/contexts/LayoutRenderingContext';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { coreViewsState } from '@/views/states/coreViewState';
import { type CoreViewWithRelations } from '@/views/types/CoreViewWithRelations';
import { ComponentDecorator } from 'twenty-ui/testing';
import {
  ViewOpenRecordIn as CoreViewOpenRecordIn,
  ViewType as CoreViewType,
  ViewVisibility as CoreViewVisibility,
  PageLayoutTabLayoutMode,
  PageLayoutType,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';
import { ChipGeneratorsDecorator } from '~/testing/decorators/ChipGeneratorsDecorator';
import { FileUploadDecorator } from '~/testing/decorators/FileUploadDecorator';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow(
  CoreObjectNameSingular.Company,
);

const nameField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: companyObjectMetadataItem,
  fieldName: 'name',
});

const addressField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: companyObjectMetadataItem,
  fieldName: 'address',
});

const employeesField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: companyObjectMetadataItem,
  fieldName: 'employees',
});

const annualRecurringRevenueField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: companyObjectMetadataItem,
  fieldName: 'annualRecurringRevenue',
});

const linkedinField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: companyObjectMetadataItem,
  fieldName: 'linkedinLink',
});

const idealCustomerProfileField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: companyObjectMetadataItem,
  fieldName: 'idealCustomerProfile',
});

const TEST_RECORD_ID = 'test-fields-widget-record-123';
const FIELDS_VIEW_ID = 'test-fields-view-001';
const TAB_ID_OVERVIEW = 'tab-overview';

const mockCompanyRecord: ObjectRecord = {
  __typename: 'Company',
  id: TEST_RECORD_ID,
  name: 'Acme Corporation',
  address: {
    addressStreet1: '123 Business St',
    addressStreet2: null,
    addressCity: 'San Francisco',
    addressState: 'CA',
    addressPostcode: '94102',
    addressCountry: 'United States',
    addressLat: null,
    addressLng: null,
  },
  employees: 250,
  linkedinLink: {
    primaryLinkUrl: 'https://linkedin.com/company/acme',
    primaryLinkLabel: null,
    secondaryLinks: null,
  },
  idealCustomerProfile: true,
  annualRecurringRevenue: {
    __typename: 'Currency',
    amountMicros: 5000000000000,
    currencyCode: 'USD',
  },
};

const setRecordInStore = (recordId: string, record: ObjectRecord) => {
  jotaiStore.set(recordStoreFamilyState.atomFamily(recordId), record);
};

const JestMetadataAndApolloMocksWrapper = getJestMetadataAndApolloMocksWrapper({
  apolloMocks: [],
});

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

const createPageLayoutWithWidget = (
  widget: PageLayoutWidget,
  objectMetadataId: string,
): PageLayout => ({
  id: PAGE_LAYOUT_TEST_INSTANCE_ID,
  name: 'Mock Page Layout',
  type: PageLayoutType.RECORD_PAGE,
  objectMetadataId,
  tabs: [
    {
      __typename: 'PageLayoutTab' as const,
      applicationId: '',
      id: TAB_ID_OVERVIEW,
      title: 'Overview',
      position: 0,
      pageLayoutId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      widgets: [widget],
      isOverridden: false,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      deletedAt: null,
    },
  ],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  deletedAt: null,
});

const createFieldsWidget = (viewId: string | null): PageLayoutWidget => ({
  __typename: 'PageLayoutWidget',
  id: 'widget-fields',
  pageLayoutTabId: TAB_ID_OVERVIEW,
  type: WidgetType.FIELDS,
  title: 'Fields',
  objectMetadataId: companyObjectMetadataItem.id,
  gridPosition: {
    __typename: 'GridPosition',
    row: 0,
    column: 0,
    rowSpan: 4,
    columnSpan: 4,
  },
  configuration: {
    __typename: 'FieldsConfiguration',
    configurationType: WidgetConfigurationType.FIELDS,
    viewId,
  },
  isOverridden: false,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  deletedAt: null,
});

const createCoreView = (
  overrides: Partial<CoreViewWithRelations> = {},
): CoreViewWithRelations => ({
  id: FIELDS_VIEW_ID,
  name: 'Company Fields',
  objectMetadataId: companyObjectMetadataItem.id,
  type: CoreViewType.FIELDS_WIDGET,
  icon: 'IconList',
  key: null,
  shouldHideEmptyGroups: false,
  position: 0,
  isCompact: false,
  openRecordIn: CoreViewOpenRecordIn.SIDE_PANEL,
  viewFields: [],
  viewGroups: [],
  viewFilters: [],
  viewSorts: [],
  visibility: CoreViewVisibility.WORKSPACE,
  createdByUserWorkspaceId: null,
  __typename: 'CoreView',
  ...overrides,
});

const meta: Meta<typeof FieldsWidget> = {
  title: 'Modules/PageLayout/Widgets/FieldsWidget',
  component: FieldsWidget,
  decorators: [
    ComponentDecorator,
    ChipGeneratorsDecorator,
    FileUploadDecorator,
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
type Story = StoryObj<typeof FieldsWidget>;

export const WithViewFieldGroups: Story = {
  render: () => {
    const coreView = createCoreView({
      viewFieldGroups: [
        {
          id: 'group-contact-info',
          name: 'Contact Info',
          position: 0,
          isVisible: true,
          isOverridden: false,
          viewId: FIELDS_VIEW_ID,
          viewFields: [
            {
              id: 'vf-name',
              fieldMetadataId: nameField.id,
              position: 0,
              isVisible: true,
              size: 200,
              aggregateOperation: null,
              isOverridden: false,
              viewId: FIELDS_VIEW_ID,
            },
            {
              id: 'vf-address',
              fieldMetadataId: addressField.id,
              position: 1,
              isVisible: true,
              size: 200,
              aggregateOperation: null,
              isOverridden: false,
              viewId: FIELDS_VIEW_ID,
            },
            {
              id: 'vf-linkedin',
              fieldMetadataId: linkedinField.id,
              position: 2,
              isVisible: true,
              size: 200,
              aggregateOperation: null,
              isOverridden: false,
              viewId: FIELDS_VIEW_ID,
            },
          ],
        },
        {
          id: 'group-business',
          name: 'Business',
          position: 1,
          isVisible: true,
          isOverridden: false,
          viewId: FIELDS_VIEW_ID,
          viewFields: [
            {
              id: 'vf-employees',
              fieldMetadataId: employeesField.id,
              position: 0,
              isVisible: true,
              size: 200,
              aggregateOperation: null,
              isOverridden: false,
              viewId: FIELDS_VIEW_ID,
            },
            {
              id: 'vf-arr',
              fieldMetadataId: annualRecurringRevenueField.id,
              position: 1,
              isVisible: true,
              size: 200,
              aggregateOperation: null,
              isOverridden: false,
              viewId: FIELDS_VIEW_ID,
            },
            {
              id: 'vf-icp',
              fieldMetadataId: idealCustomerProfileField.id,
              position: 2,
              isVisible: true,
              size: 200,
              aggregateOperation: null,
              isOverridden: false,
              viewId: FIELDS_VIEW_ID,
            },
          ],
        },
      ],
    });

    const widget = createFieldsWidget(FIELDS_VIEW_ID);

    const pageLayoutData = createPageLayoutWithWidget(
      widget,
      companyObjectMetadataItem.id,
    );

    jotaiStore.set(
      objectMetadataItemsState.atom,
      generatedMockObjectMetadataItems,
    );
    jotaiStore.set(isAppMetadataReadyState.atom, true);
    jotaiStore.set(coreViewsState.atom, [coreView]);
    jotaiStore.set(
      pageLayoutPersistedComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      }),
      pageLayoutData,
    );
    jotaiStore.set(
      pageLayoutDraftComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      }),
      pageLayoutData,
    );
    setRecordInStore(TEST_RECORD_ID, mockCompanyRecord);

    return (
      <div style={{ width: '400px', padding: '20px' }}>
        <JestMetadataAndApolloMocksWrapper>
          <CoreClientProviderWrapper>
            <PageLayoutTestWrapper store={jotaiStore}>
              <LayoutRenderingProvider
                value={{
                  isInSidePanel: false,
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
                    layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
                    tabId: TAB_ID_OVERVIEW,
                  }}
                >
                  <WidgetComponentInstanceContext.Provider
                    value={{ instanceId: widget.id }}
                  >
                    <FieldsWidget widget={widget} />
                  </WidgetComponentInstanceContext.Provider>
                </PageLayoutContentProvider>
              </LayoutRenderingProvider>
            </PageLayoutTestWrapper>
          </CoreClientProviderWrapper>
        </JestMetadataAndApolloMocksWrapper>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const contactInfoHeader = await canvas.findByText('Contact Info');
    expect(contactInfoHeader).toBeVisible();

    const businessHeader = await canvas.findByText('Business');
    expect(businessHeader).toBeVisible();

    const companyName = await canvas.findByText('Acme Corporation');
    expect(companyName).toBeVisible();
  },
};

export const WithInlineViewFields: Story = {
  render: () => {
    const coreView = createCoreView({
      viewFields: [
        {
          id: 'vf-name',
          fieldMetadataId: nameField.id,
          position: 0,
          isVisible: true,
          size: 200,
          aggregateOperation: null,
          isOverridden: false,
          viewId: FIELDS_VIEW_ID,
        },
        {
          id: 'vf-employees',
          fieldMetadataId: employeesField.id,
          position: 1,
          isVisible: true,
          size: 200,
          aggregateOperation: null,
          isOverridden: false,
          viewId: FIELDS_VIEW_ID,
        },
        {
          id: 'vf-address',
          fieldMetadataId: addressField.id,
          position: 2,
          isVisible: true,
          size: 200,
          aggregateOperation: null,
          isOverridden: false,
          viewId: FIELDS_VIEW_ID,
        },
      ],
    });

    const widget = createFieldsWidget(FIELDS_VIEW_ID);

    const pageLayoutData = createPageLayoutWithWidget(
      widget,
      companyObjectMetadataItem.id,
    );

    jotaiStore.set(
      objectMetadataItemsState.atom,
      generatedMockObjectMetadataItems,
    );
    jotaiStore.set(isAppMetadataReadyState.atom, true);
    jotaiStore.set(coreViewsState.atom, [coreView]);
    jotaiStore.set(
      pageLayoutPersistedComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      }),
      pageLayoutData,
    );
    jotaiStore.set(
      pageLayoutDraftComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      }),
      pageLayoutData,
    );
    setRecordInStore(TEST_RECORD_ID, mockCompanyRecord);

    return (
      <div style={{ width: '400px', padding: '20px' }}>
        <JestMetadataAndApolloMocksWrapper>
          <CoreClientProviderWrapper>
            <PageLayoutTestWrapper store={jotaiStore}>
              <LayoutRenderingProvider
                value={{
                  isInSidePanel: false,
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
                    layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
                    tabId: TAB_ID_OVERVIEW,
                  }}
                >
                  <WidgetComponentInstanceContext.Provider
                    value={{ instanceId: widget.id }}
                  >
                    <FieldsWidget widget={widget} />
                  </WidgetComponentInstanceContext.Provider>
                </PageLayoutContentProvider>
              </LayoutRenderingProvider>
            </PageLayoutTestWrapper>
          </CoreClientProviderWrapper>
        </JestMetadataAndApolloMocksWrapper>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const companyName = await canvas.findByText('Acme Corporation');
    expect(companyName).toBeVisible();

    const contactInfoHeader = canvas.queryByText('Contact Info');
    expect(contactInfoHeader).toBeNull();

    const generalHeader = canvas.queryByText('General');
    expect(generalHeader).toBeNull();
  },
};

export const Empty: Story = {
  render: () => {
    const coreView = createCoreView({
      viewFieldGroups: [
        {
          id: 'group-empty',
          name: 'Empty Group',
          position: 0,
          isVisible: false,
          isOverridden: false,
          viewId: FIELDS_VIEW_ID,
          viewFields: [],
        },
      ],
    });

    const widget = createFieldsWidget(FIELDS_VIEW_ID);

    const pageLayoutData = createPageLayoutWithWidget(
      widget,
      companyObjectMetadataItem.id,
    );

    jotaiStore.set(
      objectMetadataItemsState.atom,
      generatedMockObjectMetadataItems,
    );
    jotaiStore.set(isAppMetadataReadyState.atom, true);
    jotaiStore.set(coreViewsState.atom, [coreView]);
    jotaiStore.set(
      pageLayoutPersistedComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      }),
      pageLayoutData,
    );
    jotaiStore.set(
      pageLayoutDraftComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      }),
      pageLayoutData,
    );
    setRecordInStore(TEST_RECORD_ID, mockCompanyRecord);

    return (
      <div style={{ width: '400px', padding: '20px' }}>
        <JestMetadataAndApolloMocksWrapper>
          <CoreClientProviderWrapper>
            <PageLayoutTestWrapper store={jotaiStore}>
              <LayoutRenderingProvider
                value={{
                  isInSidePanel: false,
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
                    layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
                    tabId: TAB_ID_OVERVIEW,
                  }}
                >
                  <WidgetComponentInstanceContext.Provider
                    value={{ instanceId: widget.id }}
                  >
                    <FieldsWidget widget={widget} />
                  </WidgetComponentInstanceContext.Provider>
                </PageLayoutContentProvider>
              </LayoutRenderingProvider>
            </PageLayoutTestWrapper>
          </CoreClientProviderWrapper>
        </JestMetadataAndApolloMocksWrapper>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => {
      expect(canvas.getByText('No fields to display')).toBeVisible();
    });

    await waitFor(() => {
      expect(
        canvas.getByText('Configure this widget to display fields'),
      ).toBeVisible();
    });
  },
};
