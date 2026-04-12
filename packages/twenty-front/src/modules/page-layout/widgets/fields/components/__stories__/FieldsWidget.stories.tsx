import { type ApolloClient } from '@apollo/client';
import { useApolloClient } from '@apollo/client/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { expect, waitFor, within } from 'storybook/test';

import { isMinimalMetadataReadyState } from '@/metadata-store/states/isMinimalMetadataReadyState';
import { ApolloCoreClientContext } from '@/object-metadata/contexts/ApolloCoreClientContext';
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
import { type ViewWithRelations } from '@/views/types/ViewWithRelations';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { ComponentDecorator } from 'twenty-ui/testing';
import {
  ViewOpenRecordIn,
  ViewType,
  ViewVisibility,
  PageLayoutTabLayoutMode,
  PageLayoutType,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';
import { ChipGeneratorsDecorator } from '~/testing/decorators/ChipGeneratorsDecorator';
import { FileUploadDecorator } from '~/testing/decorators/FileUploadDecorator';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { setTestViewsInMetadataStore } from '~/testing/utils/setTestViewsInMetadataStore';
import { setTestObjectMetadataItemsInMetadataStore } from '~/testing/utils/setTestObjectMetadataItemsInMetadataStore';

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
  const apolloClient = useApolloClient() as ApolloClient;

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
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  deletedAt: null,
});

const createView = (
  overrides: Partial<ViewWithRelations> = {},
): ViewWithRelations => ({
  id: FIELDS_VIEW_ID,
  name: 'Company Fields',
  objectMetadataId: companyObjectMetadataItem.id,
  type: ViewType.FIELDS_WIDGET,
  icon: 'IconList',
  key: null,
  shouldHideEmptyGroups: false,
  position: 0,
  isCompact: false,
  openRecordIn: ViewOpenRecordIn.SIDE_PANEL,
  viewFields: [],
  viewGroups: [],
  viewFilters: [],
  viewSorts: [],
  visibility: ViewVisibility.WORKSPACE,
  createdByUserWorkspaceId: null,
  ...overrides,
});

const createViewField = (
  id: string,
  fieldMetadataId: string,
  position: number,
  viewFieldGroupId?: string,
) => ({
  id,
  fieldMetadataId,
  position,
  isVisible: true,
  size: 200,
  aggregateOperation: null,
  viewId: FIELDS_VIEW_ID,
  ...(viewFieldGroupId !== undefined && { viewFieldGroupId }),
});

const createViewFieldGroup = (
  id: string,
  name: string,
  position: number,
  viewFields: ReturnType<typeof createViewField>[],
  isVisible = true,
) => ({
  id,
  name,
  position,
  isVisible,
  viewId: FIELDS_VIEW_ID,
  viewFields,
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
    const contactInfoFields = [
      createViewField('vf-name', nameField.id, 0, 'group-contact-info'),
      createViewField('vf-address', addressField.id, 1, 'group-contact-info'),
      createViewField('vf-linkedin', linkedinField.id, 2, 'group-contact-info'),
    ];

    const businessFields = [
      createViewField('vf-employees', employeesField.id, 0, 'group-business'),
      createViewField(
        'vf-arr',
        annualRecurringRevenueField.id,
        1,
        'group-business',
      ),
      createViewField(
        'vf-icp',
        idealCustomerProfileField.id,
        2,
        'group-business',
      ),
    ];

    const view = createView({
      viewFields: [...contactInfoFields, ...businessFields],
      viewFieldGroups: [
        createViewFieldGroup(
          'group-contact-info',
          'Contact Info',
          0,
          contactInfoFields,
        ),
        createViewFieldGroup('group-business', 'Business', 1, businessFields),
      ],
    });

    const widget = createFieldsWidget(FIELDS_VIEW_ID);

    const pageLayoutData = createPageLayoutWithWidget(
      widget,
      companyObjectMetadataItem.id,
    );

    setTestObjectMetadataItemsInMetadataStore(
      jotaiStore,
      getTestEnrichedObjectMetadataItemsMock(),
    );
    jotaiStore.set(isMinimalMetadataReadyState.atom, true);
    setTestViewsInMetadataStore(jotaiStore, [view]);
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

export const WithDefaultGroups: Story = {
  render: () => {
    const view = createView();

    const widget = createFieldsWidget(FIELDS_VIEW_ID);

    const pageLayoutData = createPageLayoutWithWidget(
      widget,
      companyObjectMetadataItem.id,
    );

    setTestObjectMetadataItemsInMetadataStore(
      jotaiStore,
      getTestEnrichedObjectMetadataItemsMock(),
    );
    jotaiStore.set(isMinimalMetadataReadyState.atom, true);
    setTestViewsInMetadataStore(jotaiStore, [view]);
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

    const generalHeader = await canvas.findByText('General');
    expect(generalHeader).toBeVisible();

    const creationDateElements = await canvas.findAllByText('Creation date');
    expect(creationDateElements.length).toBeGreaterThan(0);
    expect(creationDateElements[0]).toBeVisible();
  },
};

export const Empty: Story = {
  render: () => {
    const view = createView({
      viewFieldGroups: [
        createViewFieldGroup('group-empty', 'Empty Group', 0, [], false),
      ],
    });

    const widget = createFieldsWidget(FIELDS_VIEW_ID);

    const pageLayoutData = createPageLayoutWithWidget(
      widget,
      companyObjectMetadataItem.id,
    );

    setTestObjectMetadataItemsInMetadataStore(
      jotaiStore,
      getTestEnrichedObjectMetadataItemsMock(),
    );
    jotaiStore.set(isMinimalMetadataReadyState.atom, true);
    setTestViewsInMetadataStore(jotaiStore, [view]);
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
