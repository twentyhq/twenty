import {
  type ApolloClient,
  type NormalizedCacheObject,
  useApolloClient,
} from '@apollo/client';
import { type Meta, type StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { MemoryRouter } from 'react-router-dom';
import { type MutableSnapshot } from 'recoil';

import { ApolloCoreClientContext } from '@/object-metadata/contexts/ApolloCoreClientContext';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { shouldAppBeLoadingState } from '@/object-metadata/states/shouldAppBeLoadingState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { PageLayoutContentProvider } from '@/page-layout/contexts/PageLayoutContentContext';
import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { FieldWidget } from '@/page-layout/widgets/field/components/FieldWidget';
import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { LayoutRenderingProvider } from '@/ui/layout/contexts/LayoutRenderingContext';
import { ComponentDecorator } from 'twenty-ui/testing';
import {
  PageLayoutType,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';
import { ChipGeneratorsDecorator } from '~/testing/decorators/ChipGeneratorsDecorator';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow(
  CoreObjectNameSingular.Company,
);

const personObjectMetadataItem = getMockObjectMetadataItemOrThrow(
  CoreObjectNameSingular.Person,
);

const opportunityObjectMetadataItem = getMockObjectMetadataItemOrThrow(
  CoreObjectNameSingular.Opportunity,
);

const timelineActivityObjectMetadataItem = getMockObjectMetadataItemOrThrow(
  CoreObjectNameSingular.TimelineActivity,
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

const linkedinField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: companyObjectMetadataItem,
  fieldName: 'linkedinLink',
});

const accountOwnerField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: companyObjectMetadataItem,
  fieldName: 'accountOwner',
});

const idealCustomerProfileField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: companyObjectMetadataItem,
  fieldName: 'idealCustomerProfile',
});

const annualRecurringRevenueField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: companyObjectMetadataItem,
  fieldName: 'annualRecurringRevenue',
});

const personEmailsField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: personObjectMetadataItem,
  fieldName: 'emails',
});

const personPhonesField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: personObjectMetadataItem,
  fieldName: 'phones',
});

const opportunityStageField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: opportunityObjectMetadataItem,
  fieldName: 'stage',
});

const companyWorkPolicyField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: companyObjectMetadataItem,
  fieldName: 'workPolicy',
});

const companyPeopleField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: companyObjectMetadataItem,
  fieldName: 'people',
});

const timelineActivityWorkspaceMemberField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: timelineActivityObjectMetadataItem,
  fieldName: 'workspaceMember',
});

const TEST_RECORD_ID = 'test-record-123';
const TEST_PERSON_RECORD_ID = 'test-person-456';
const TEST_OPPORTUNITY_RECORD_ID = 'test-opportunity-789';
const TEST_TIMELINE_ACTIVITY_RECORD_ID = 'test-timeline-def';

const mockPersonRecord: ObjectRecord = {
  __typename: 'Person',
  id: TEST_PERSON_RECORD_ID,
  name: {
    __typename: 'FullName',
    firstName: 'Jane',
    lastName: 'Smith',
  },
  emails: {
    __typename: 'Emails',
    primaryEmail: 'jane.smith@acme.com',
    additionalEmails: ['jane@personal.com'],
  },
  phones: {
    __typename: 'Phones',
    primaryPhoneNumber: '5551234567',
    primaryPhoneCountryCode: '+1',
    primaryPhoneCallingCode: '+1',
    additionalPhones: [],
  },
};

const mockOpportunityRecord: ObjectRecord = {
  __typename: 'Opportunity',
  id: TEST_OPPORTUNITY_RECORD_ID,
  name: 'Enterprise Deal',
  stage: 'PROPOSAL',
  amount: {
    __typename: 'Currency',
    amountMicros: 500000000000,
    currencyCode: 'USD',
  },
  closeDate: '2025-12-31T00:00:00Z',
};

const mockWorkspaceMemberRecord: ObjectRecord = {
  __typename: 'WorkspaceMember',
  id: 'test-workspace-member-xyz',
  name: {
    __typename: 'FullName',
    firstName: 'Sarah',
    lastName: 'Johnson',
  },
  avatarUrl: '',
  userEmail: 'sarah.johnson@acme.com',
  colorScheme: 'Light',
  locale: 'en',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  userId: 'test-user-xyz',
};

const mockTimelineActivityRecord: ObjectRecord = {
  __typename: 'TimelineActivity',
  id: TEST_TIMELINE_ACTIVITY_RECORD_ID,
  name: 'Note created',
  workspaceMember: {
    __typename: 'WorkspaceMember',
    id: 'test-workspace-member-xyz',
    name: {
      __typename: 'FullName',
      firstName: 'Sarah',
      lastName: 'Johnson',
    },
    avatarUrl: '',
    userEmail: 'sarah.johnson@acme.com',
    colorScheme: 'Light',
    locale: 'en',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    userId: 'test-user-xyz',
  },
  happenedAt: '2025-01-15T10:30:00Z',
};

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
  workPolicy: ['ON_SITE', 'HYBRID'],
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

const TAB_ID_OVERVIEW = 'tab-overview';

const createPageLayoutWithWidget = (
  widget: PageLayoutWidget,
  objectMetadataId: string,
) => ({
  id: PAGE_LAYOUT_TEST_INSTANCE_ID,
  name: 'Mock Page Layout',
  type: PageLayoutType.RECORD_PAGE,
  objectMetadataId,
  tabs: [
    {
      __typename: 'PageLayoutTab' as const,
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

const meta: Meta<typeof FieldWidget> = {
  title: 'Modules/PageLayout/Widgets/FieldWidget',
  component: FieldWidget,
  decorators: [
    ComponentDecorator,
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
type Story = StoryObj<typeof FieldWidget>;

export const TextFieldWidget: Story = {
  render: () => {
    const widget: PageLayoutWidget = {
      __typename: 'PageLayoutWidget',
      id: 'widget-text-field',
      pageLayoutTabId: TAB_ID_OVERVIEW,
      type: WidgetType.FIELD,
      title: 'Company Name',
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
        fieldMetadataId: nameField.id,
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
        companyObjectMetadataItem.id,
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
      snapshot.set(recordStoreFamilyState(TEST_RECORD_ID), mockCompanyRecord);
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
                    tabId: 'fields',
                  }}
                >
                  <WidgetComponentInstanceContext.Provider
                    value={{ instanceId: widget.id }}
                  >
                    <FieldWidget widget={widget} />
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
  },
};

export const AddressFieldWidget: Story = {
  render: () => {
    const widget: PageLayoutWidget = {
      __typename: 'PageLayoutWidget',
      id: 'widget-address-field',
      pageLayoutTabId: TAB_ID_OVERVIEW,
      type: WidgetType.FIELD,
      title: 'Address',
      objectMetadataId: companyObjectMetadataItem.id,
      gridPosition: {
        __typename: 'GridPosition',
        row: 1,
        column: 0,
        rowSpan: 1,
        columnSpan: 3,
      },
      configuration: {
        __typename: 'FieldConfiguration',
        configurationType: WidgetConfigurationType.FIELD,
        fieldMetadataId: addressField.id,
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
        companyObjectMetadataItem.id,
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
      snapshot.set(recordStoreFamilyState(TEST_RECORD_ID), mockCompanyRecord);
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
                    tabId: 'fields',
                  }}
                >
                  <WidgetComponentInstanceContext.Provider
                    value={{ instanceId: widget.id }}
                  >
                    <FieldWidget widget={widget} />
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

    const street = await canvas.findByText(/123 Business St/i);
    expect(street).toBeVisible();

    const city = await canvas.findByText(/San Francisco/i);
    expect(city).toBeVisible();
  },
};

export const NumberFieldWidget: Story = {
  render: () => {
    const widget: PageLayoutWidget = {
      __typename: 'PageLayoutWidget',
      id: 'widget-number-field',
      pageLayoutTabId: TAB_ID_OVERVIEW,
      type: WidgetType.FIELD,
      title: 'Employees',
      objectMetadataId: companyObjectMetadataItem.id,
      gridPosition: {
        __typename: 'GridPosition',
        row: 2,
        column: 0,
        rowSpan: 1,
        columnSpan: 2,
      },
      configuration: {
        __typename: 'FieldConfiguration',
        configurationType: WidgetConfigurationType.FIELD,
        fieldMetadataId: employeesField.id,
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
        companyObjectMetadataItem.id,
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
      snapshot.set(recordStoreFamilyState(TEST_RECORD_ID), mockCompanyRecord);
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
                    tabId: 'fields',
                  }}
                >
                  <WidgetComponentInstanceContext.Provider
                    value={{ instanceId: widget.id }}
                  >
                    <FieldWidget widget={widget} />
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

    const employeeCount = await canvas.findByText('250');
    expect(employeeCount).toBeVisible();
  },
};

export const LinkFieldWidget: Story = {
  render: () => {
    const widget: PageLayoutWidget = {
      __typename: 'PageLayoutWidget',
      id: 'widget-link-field',
      pageLayoutTabId: TAB_ID_OVERVIEW,
      type: WidgetType.FIELD,
      title: 'LinkedIn',
      objectMetadataId: companyObjectMetadataItem.id,
      gridPosition: {
        __typename: 'GridPosition',
        row: 3,
        column: 0,
        rowSpan: 1,
        columnSpan: 2,
      },
      configuration: {
        __typename: 'FieldConfiguration',
        configurationType: WidgetConfigurationType.FIELD,
        fieldMetadataId: linkedinField.id,
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
        companyObjectMetadataItem.id,
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
      snapshot.set(recordStoreFamilyState(TEST_RECORD_ID), mockCompanyRecord);
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
                    tabId: 'fields',
                  }}
                >
                  <WidgetComponentInstanceContext.Provider
                    value={{ instanceId: widget.id }}
                  >
                    <FieldWidget widget={widget} />
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

    const linkedinLink = await canvas.findByText(/acme/i);
    expect(linkedinLink).toBeVisible();
  },
};

export const ManyToOneRelationFieldWidget: Story = {
  render: () => {
    const widget: PageLayoutWidget = {
      __typename: 'PageLayoutWidget',
      id: 'widget-relation-field',
      pageLayoutTabId: TAB_ID_OVERVIEW,
      type: WidgetType.FIELD,
      title: 'Account Owner',
      objectMetadataId: companyObjectMetadataItem.id,
      gridPosition: {
        __typename: 'GridPosition',
        row: 4,
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
        companyObjectMetadataItem.id,
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
      snapshot.set(recordStoreFamilyState(TEST_RECORD_ID), mockCompanyRecord);
      // Set the related WorkspaceMember record for relation field display
      if (
        mockCompanyRecord.accountOwner !== null &&
        mockCompanyRecord.accountOwner !== undefined
      ) {
        snapshot.set(
          recordStoreFamilyState(mockCompanyRecord.accountOwner.id),
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
                    tabId: 'fields',
                  }}
                >
                  <WidgetComponentInstanceContext.Provider
                    value={{ instanceId: widget.id }}
                  >
                    <FieldWidget widget={widget} />
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

    const accountOwner = await canvas.findByText('John Doe');
    expect(accountOwner).toBeVisible();
  },
};

export const OneToManyRelationFieldWidget: Story = {
  render: () => {
    const widget: PageLayoutWidget = {
      __typename: 'PageLayoutWidget',
      id: 'widget-one-to-many-relation-field',
      pageLayoutTabId: TAB_ID_OVERVIEW,
      type: WidgetType.FIELD,
      title: 'People',
      objectMetadataId: companyObjectMetadataItem.id,
      gridPosition: {
        __typename: 'GridPosition',
        row: 11,
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
        companyObjectMetadataItem.id,
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
      snapshot.set(recordStoreFamilyState(TEST_RECORD_ID), mockCompanyRecord);
      // Set the related Person record for ONE_TO_MANY relation display
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
                    tabId: 'fields',
                  }}
                >
                  <WidgetComponentInstanceContext.Provider
                    value={{ instanceId: widget.id }}
                  >
                    <FieldWidget widget={widget} />
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

    const personChip = await canvas.findByText('Jane Smith');
    expect(personChip).toBeVisible();
  },
};

export const BooleanFieldWidget: Story = {
  render: () => {
    const widget: PageLayoutWidget = {
      __typename: 'PageLayoutWidget',
      id: 'widget-boolean-field',
      pageLayoutTabId: TAB_ID_OVERVIEW,
      type: WidgetType.FIELD,
      title: 'Ideal Customer Profile',
      objectMetadataId: companyObjectMetadataItem.id,
      gridPosition: {
        __typename: 'GridPosition',
        row: 5,
        column: 0,
        rowSpan: 1,
        columnSpan: 2,
      },
      configuration: {
        __typename: 'FieldConfiguration',
        configurationType: WidgetConfigurationType.FIELD,
        fieldMetadataId: idealCustomerProfileField.id,
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
        companyObjectMetadataItem.id,
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
      snapshot.set(recordStoreFamilyState(TEST_RECORD_ID), mockCompanyRecord);
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
                    tabId: 'fields',
                  }}
                >
                  <WidgetComponentInstanceContext.Provider
                    value={{ instanceId: widget.id }}
                  >
                    <FieldWidget widget={widget} />
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

    expect(await canvas.findByText('True')).toBeVisible();
  },
};

export const CurrencyFieldWidget: Story = {
  render: () => {
    const widget: PageLayoutWidget = {
      __typename: 'PageLayoutWidget',
      id: 'widget-currency-field',
      pageLayoutTabId: TAB_ID_OVERVIEW,
      type: WidgetType.FIELD,
      title: 'Annual Recurring Revenue',
      objectMetadataId: companyObjectMetadataItem.id,
      gridPosition: {
        __typename: 'GridPosition',
        row: 6,
        column: 0,
        rowSpan: 1,
        columnSpan: 2,
      },
      configuration: {
        __typename: 'FieldConfiguration',
        configurationType: WidgetConfigurationType.FIELD,
        fieldMetadataId: annualRecurringRevenueField.id,
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
        companyObjectMetadataItem.id,
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
      snapshot.set(recordStoreFamilyState(TEST_RECORD_ID), mockCompanyRecord);
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
                    tabId: 'fields',
                  }}
                >
                  <WidgetComponentInstanceContext.Provider
                    value={{ instanceId: widget.id }}
                  >
                    <FieldWidget widget={widget} />
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

    expect(await canvas.findByText('5m')).toBeVisible();
  },
};

export const EmailsFieldWidget: Story = {
  render: () => {
    const widget: PageLayoutWidget = {
      __typename: 'PageLayoutWidget',
      id: 'widget-emails-field',
      pageLayoutTabId: TAB_ID_OVERVIEW,
      type: WidgetType.FIELD,
      title: 'Emails',
      objectMetadataId: personObjectMetadataItem.id,
      gridPosition: {
        __typename: 'GridPosition',
        row: 7,
        column: 0,
        rowSpan: 1,
        columnSpan: 2,
      },
      configuration: {
        __typename: 'FieldConfiguration',
        configurationType: WidgetConfigurationType.FIELD,
        fieldMetadataId: personEmailsField.id,
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
        personObjectMetadataItem.id,
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
                    id: TEST_PERSON_RECORD_ID,
                    targetObjectNameSingular:
                      personObjectMetadataItem.nameSingular,
                  },
                }}
              >
                <PageLayoutContentProvider
                  value={{
                    layoutMode: 'vertical-list',
                    tabId: 'fields',
                  }}
                >
                  <WidgetComponentInstanceContext.Provider
                    value={{ instanceId: widget.id }}
                  >
                    <FieldWidget widget={widget} />
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

    const email = await canvas.findByText(/jane\.smith@acme\.com/);
    expect(email).toBeVisible();
  },
};

export const PhonesFieldWidget: Story = {
  render: () => {
    const widget: PageLayoutWidget = {
      __typename: 'PageLayoutWidget',
      id: 'widget-phones-field',
      pageLayoutTabId: TAB_ID_OVERVIEW,
      type: WidgetType.FIELD,
      title: 'Phones',
      objectMetadataId: personObjectMetadataItem.id,
      gridPosition: {
        __typename: 'GridPosition',
        row: 8,
        column: 0,
        rowSpan: 1,
        columnSpan: 2,
      },
      configuration: {
        __typename: 'FieldConfiguration',
        configurationType: WidgetConfigurationType.FIELD,
        fieldMetadataId: personPhonesField.id,
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
        personObjectMetadataItem.id,
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
                    id: TEST_PERSON_RECORD_ID,
                    targetObjectNameSingular:
                      personObjectMetadataItem.nameSingular,
                  },
                }}
              >
                <PageLayoutContentProvider
                  value={{
                    layoutMode: 'vertical-list',
                    tabId: 'fields',
                  }}
                >
                  <WidgetComponentInstanceContext.Provider
                    value={{ instanceId: widget.id }}
                  >
                    <FieldWidget widget={widget} />
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

    const phone = await canvas.findByText(/555/);
    expect(phone).toBeVisible();
  },
};

export const SelectFieldWidget: Story = {
  render: () => {
    const widget: PageLayoutWidget = {
      __typename: 'PageLayoutWidget',
      id: 'widget-select-field',
      pageLayoutTabId: TAB_ID_OVERVIEW,
      type: WidgetType.FIELD,
      title: 'Stage',
      objectMetadataId: opportunityObjectMetadataItem.id,
      gridPosition: {
        __typename: 'GridPosition',
        row: 9,
        column: 0,
        rowSpan: 1,
        columnSpan: 2,
      },
      configuration: {
        __typename: 'FieldConfiguration',
        configurationType: WidgetConfigurationType.FIELD,
        fieldMetadataId: opportunityStageField.id,
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
        opportunityObjectMetadataItem.id,
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
        recordStoreFamilyState(TEST_OPPORTUNITY_RECORD_ID),
        mockOpportunityRecord,
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
                    id: TEST_OPPORTUNITY_RECORD_ID,
                    targetObjectNameSingular:
                      opportunityObjectMetadataItem.nameSingular,
                  },
                }}
              >
                <PageLayoutContentProvider
                  value={{
                    layoutMode: 'vertical-list',
                    tabId: 'fields',
                  }}
                >
                  <WidgetComponentInstanceContext.Provider
                    value={{ instanceId: widget.id }}
                  >
                    <FieldWidget widget={widget} />
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

    // Select field displays the selected option label
    const stage = await canvas.findByText(/Proposal/);
    expect(stage).toBeVisible();
  },
};

export const MultiSelectFieldWidget: Story = {
  render: () => {
    const widget: PageLayoutWidget = {
      __typename: 'PageLayoutWidget',
      id: 'widget-multi-select-field',
      pageLayoutTabId: TAB_ID_OVERVIEW,
      type: WidgetType.FIELD,
      title: 'Work Policy',
      objectMetadataId: companyObjectMetadataItem.id,
      gridPosition: {
        __typename: 'GridPosition',
        row: 10,
        column: 0,
        rowSpan: 1,
        columnSpan: 2,
      },
      configuration: {
        __typename: 'FieldConfiguration',
        configurationType: WidgetConfigurationType.FIELD,
        fieldMetadataId: companyWorkPolicyField.id,
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
        companyObjectMetadataItem.id,
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
      snapshot.set(recordStoreFamilyState(TEST_RECORD_ID), mockCompanyRecord);
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
                    tabId: 'fields',
                  }}
                >
                  <WidgetComponentInstanceContext.Provider
                    value={{ instanceId: widget.id }}
                  >
                    <FieldWidget widget={widget} />
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

    // Multi-select displays multiple chips
    const onSiteChip = await canvas.findByText(/On-Site/);
    expect(onSiteChip).toBeVisible();

    const hybridChip = await canvas.findByText(/Hybrid/);
    expect(hybridChip).toBeVisible();
  },
};

export const TimelineActivityRelationFieldWidget: Story = {
  render: () => {
    const widget: PageLayoutWidget = {
      __typename: 'PageLayoutWidget',
      id: 'widget-timeline-activity-relation-field',
      pageLayoutTabId: TAB_ID_OVERVIEW,
      type: WidgetType.FIELD,
      title: 'Workspace Member',
      objectMetadataId: timelineActivityObjectMetadataItem.id,
      gridPosition: {
        __typename: 'GridPosition',
        row: 12,
        column: 0,
        rowSpan: 1,
        columnSpan: 2,
      },
      configuration: {
        __typename: 'FieldConfiguration',
        configurationType: WidgetConfigurationType.FIELD,
        fieldMetadataId: timelineActivityWorkspaceMemberField.id,
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
        timelineActivityObjectMetadataItem.id,
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
        recordStoreFamilyState(TEST_TIMELINE_ACTIVITY_RECORD_ID),
        mockTimelineActivityRecord,
      );
      // Set the related WorkspaceMember record for TimelineActivity relation display
      snapshot.set(
        recordStoreFamilyState('test-workspace-member-xyz'),
        mockWorkspaceMemberRecord,
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
                    id: TEST_TIMELINE_ACTIVITY_RECORD_ID,
                    targetObjectNameSingular:
                      timelineActivityObjectMetadataItem.nameSingular,
                  },
                }}
              >
                <PageLayoutContentProvider
                  value={{
                    layoutMode: 'vertical-list',
                    tabId: 'fields',
                  }}
                >
                  <WidgetComponentInstanceContext.Provider
                    value={{ instanceId: widget.id }}
                  >
                    <FieldWidget widget={widget} />
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

    // MANY_TO_ONE relation from TimelineActivity to WorkspaceMember
    const workspaceMemberChip = await canvas.findByText('Sarah Johnson');
    expect(workspaceMemberChip).toBeVisible();
  },
};
