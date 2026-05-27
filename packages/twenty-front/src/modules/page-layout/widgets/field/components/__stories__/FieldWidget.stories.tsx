import { type ApolloClient } from '@apollo/client';
import { useApolloClient } from '@apollo/client/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { expect, userEvent, waitFor, within } from 'storybook/test';

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
import { FieldWidget } from '@/page-layout/widgets/field/components/FieldWidget';
import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { LayoutRenderingProvider } from '@/ui/layout/contexts/LayoutRenderingContext';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { ComponentDecorator } from 'twenty-ui/testing';
import {
  FieldDisplayMode,
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
import { setTestObjectMetadataItemsInMetadataStore } from '~/testing/utils/setTestObjectMetadataItemsInMetadataStore';

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

const setRecordInStores = (recordId: string, record: ObjectRecord) => {
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

const TAB_ID_OVERVIEW = 'tab-overview';

const createPageLayoutWithWidget = (
  widget: PageLayoutWidget,
  objectMetadataId: string,
): PageLayout => ({
  id: PAGE_LAYOUT_TEST_INSTANCE_ID,
  name: 'Mock Page Layout',
  type: PageLayoutType.RECORD_PAGE,
  objectMetadataId,
  universalIdentifier: '20202020-0000-0000-0000-000000000001',
  tabs: [
    {
      __typename: 'PageLayoutTab' as const,
      isActive: true,
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

type BuildFieldWidgetArgs = {
  id: string;
  title: string;
  objectMetadataId: string;
  fieldMetadataId: string;
  fieldDisplayMode: FieldDisplayMode;
};

const buildFieldWidget = ({
  id,
  title,
  objectMetadataId,
  fieldMetadataId,
  fieldDisplayMode,
}: BuildFieldWidgetArgs): PageLayoutWidget => ({
  __typename: 'PageLayoutWidget',
  applicationId: '',
  isActive: true,
  id,
  pageLayoutTabId: TAB_ID_OVERVIEW,
  type: WidgetType.FIELD,
  title,
  objectMetadataId,
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
    fieldMetadataId,
    fieldDisplayMode,
  },
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  deletedAt: null,
});

type FieldWidgetStorySetup = {
  widget: PageLayoutWidget;
  objectMetadataId: string;
  targetRecord: { id: string; nameSingular: string };
  records: Array<{ id: string; record: ObjectRecord }>;
};

const renderFieldWidgetStory = ({
  widget,
  objectMetadataId,
  targetRecord,
  records,
}: FieldWidgetStorySetup) => {
  setTestObjectMetadataItemsInMetadataStore(
    jotaiStore,
    getTestEnrichedObjectMetadataItemsMock(),
  );
  jotaiStore.set(isMinimalMetadataReadyState.atom, true);
  const pageLayoutData = createPageLayoutWithWidget(widget, objectMetadataId);
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
  records.forEach(({ id, record }) => setRecordInStores(id, record));

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
                  id: targetRecord.id,
                  targetObjectNameSingular: targetRecord.nameSingular,
                },
              }}
            >
              <PageLayoutContentProvider
                value={{
                  layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
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
};

const companyTargetRecord = {
  id: TEST_RECORD_ID,
  nameSingular: companyObjectMetadataItem.nameSingular,
};

const personTargetRecord = {
  id: TEST_PERSON_RECORD_ID,
  nameSingular: personObjectMetadataItem.nameSingular,
};

const opportunityTargetRecord = {
  id: TEST_OPPORTUNITY_RECORD_ID,
  nameSingular: opportunityObjectMetadataItem.nameSingular,
};

const timelineActivityTargetRecord = {
  id: TEST_TIMELINE_ACTIVITY_RECORD_ID,
  nameSingular: timelineActivityObjectMetadataItem.nameSingular,
};

const companyRecords = [{ id: TEST_RECORD_ID, record: mockCompanyRecord }];

const companyRecordsWithAccountOwner: FieldWidgetStorySetup['records'] = [
  { id: TEST_RECORD_ID, record: mockCompanyRecord },
  ...(mockCompanyRecord.accountOwner !== null &&
  mockCompanyRecord.accountOwner !== undefined
    ? [
        {
          id: mockCompanyRecord.accountOwner.id,
          record: mockCompanyRecord.accountOwner,
        },
      ]
    : []),
];

const companyRecordsWithPerson: FieldWidgetStorySetup['records'] = [
  { id: TEST_RECORD_ID, record: mockCompanyRecord },
  { id: TEST_PERSON_RECORD_ID, record: mockPersonRecord },
];

const personRecords = [{ id: TEST_PERSON_RECORD_ID, record: mockPersonRecord }];

const opportunityRecords = [
  { id: TEST_OPPORTUNITY_RECORD_ID, record: mockOpportunityRecord },
];

const timelineActivityRecords: FieldWidgetStorySetup['records'] = [
  {
    id: TEST_TIMELINE_ACTIVITY_RECORD_ID,
    record: mockTimelineActivityRecord,
  },
  { id: 'test-workspace-member-xyz', record: mockWorkspaceMemberRecord },
];

const meta: Meta<typeof FieldWidget> = {
  title: 'Modules/PageLayout/Widgets/FieldWidget',
  component: FieldWidget,
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
type Story = StoryObj<typeof FieldWidget>;

export const TextFieldWidget: Story = {
  render: () =>
    renderFieldWidgetStory({
      widget: buildFieldWidget({
        id: 'widget-text-field',
        title: 'Company Name',
        objectMetadataId: companyObjectMetadataItem.id,
        fieldMetadataId: nameField.id,
        fieldDisplayMode: FieldDisplayMode.FIELD,
      }),
      objectMetadataId: companyObjectMetadataItem.id,
      targetRecord: companyTargetRecord,
      records: companyRecords,
    }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const companyName = await canvas.findByText('Acme Corporation');
    expect(companyName).toBeVisible();
  },
};

export const TextFieldEditorWidget: Story = {
  render: () =>
    renderFieldWidgetStory({
      widget: buildFieldWidget({
        id: 'widget-text-editor-field',
        title: 'Company Name',
        objectMetadataId: companyObjectMetadataItem.id,
        fieldMetadataId: nameField.id,
        fieldDisplayMode: FieldDisplayMode.EDITOR,
      }),
      objectMetadataId: companyObjectMetadataItem.id,
      targetRecord: companyTargetRecord,
      records: companyRecords,
    }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const companyNameEditor =
      await canvas.findByDisplayValue('Acme Corporation');
    expect(companyNameEditor).toBeVisible();
  },
};

export const AddressFieldWidget: Story = {
  render: () =>
    renderFieldWidgetStory({
      widget: buildFieldWidget({
        id: 'widget-address-field',
        title: 'Address',
        objectMetadataId: companyObjectMetadataItem.id,
        fieldMetadataId: addressField.id,
        fieldDisplayMode: FieldDisplayMode.FIELD,
      }),
      objectMetadataId: companyObjectMetadataItem.id,
      targetRecord: companyTargetRecord,
      records: companyRecords,
    }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const street = await canvas.findByText(/123 Business St/i);
    expect(street).toBeVisible();

    const city = await canvas.findByText(/San Francisco/i);
    expect(city).toBeVisible();
  },
};

export const NumberFieldWidget: Story = {
  render: () =>
    renderFieldWidgetStory({
      widget: buildFieldWidget({
        id: 'widget-number-field',
        title: 'Employees',
        objectMetadataId: companyObjectMetadataItem.id,
        fieldMetadataId: employeesField.id,
        fieldDisplayMode: FieldDisplayMode.FIELD,
      }),
      objectMetadataId: companyObjectMetadataItem.id,
      targetRecord: companyTargetRecord,
      records: companyRecords,
    }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const employeeCount = await canvas.findByText('250');
    expect(employeeCount).toBeVisible();
  },
};

export const LinkFieldWidget: Story = {
  render: () =>
    renderFieldWidgetStory({
      widget: buildFieldWidget({
        id: 'widget-link-field',
        title: 'LinkedIn',
        objectMetadataId: companyObjectMetadataItem.id,
        fieldMetadataId: linkedinField.id,
        fieldDisplayMode: FieldDisplayMode.FIELD,
      }),
      objectMetadataId: companyObjectMetadataItem.id,
      targetRecord: companyTargetRecord,
      records: companyRecords,
    }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const linkedinLink = await canvas.findByText(/acme/i);
    expect(linkedinLink).toBeVisible();
  },
};

export const ManyToOneRelationFieldWidget: Story = {
  render: () =>
    renderFieldWidgetStory({
      widget: buildFieldWidget({
        id: 'widget-relation-field',
        title: 'Account Owner',
        objectMetadataId: companyObjectMetadataItem.id,
        fieldMetadataId: accountOwnerField.id,
        fieldDisplayMode: FieldDisplayMode.FIELD,
      }),
      objectMetadataId: companyObjectMetadataItem.id,
      targetRecord: companyTargetRecord,
      records: companyRecordsWithAccountOwner,
    }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const accountOwner = await canvas.findByText('John Doe');
    expect(accountOwner).toBeVisible();
  },
};

export const OneToManyRelationFieldWidget: Story = {
  render: () =>
    renderFieldWidgetStory({
      widget: buildFieldWidget({
        id: 'widget-one-to-many-relation-field',
        title: 'People',
        objectMetadataId: companyObjectMetadataItem.id,
        fieldMetadataId: companyPeopleField.id,
        fieldDisplayMode: FieldDisplayMode.FIELD,
      }),
      objectMetadataId: companyObjectMetadataItem.id,
      targetRecord: companyTargetRecord,
      records: companyRecordsWithPerson,
    }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const personChip = await canvas.findByText('Jane Smith');
    expect(personChip).toBeVisible();
  },
};

export const BooleanFieldWidget: Story = {
  render: () =>
    renderFieldWidgetStory({
      widget: buildFieldWidget({
        id: 'widget-boolean-field',
        title: 'Ideal Customer Profile',
        objectMetadataId: companyObjectMetadataItem.id,
        fieldMetadataId: idealCustomerProfileField.id,
        fieldDisplayMode: FieldDisplayMode.FIELD,
      }),
      objectMetadataId: companyObjectMetadataItem.id,
      targetRecord: companyTargetRecord,
      records: companyRecords,
    }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('True')).toBeVisible();
  },
};

export const CurrencyFieldWidget: Story = {
  render: () =>
    renderFieldWidgetStory({
      widget: buildFieldWidget({
        id: 'widget-currency-field',
        title: 'Annual Recurring Revenue',
        objectMetadataId: companyObjectMetadataItem.id,
        fieldMetadataId: annualRecurringRevenueField.id,
        fieldDisplayMode: FieldDisplayMode.FIELD,
      }),
      objectMetadataId: companyObjectMetadataItem.id,
      targetRecord: companyTargetRecord,
      records: companyRecords,
    }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('5m')).toBeVisible();
  },
};

export const EmailsFieldWidget: Story = {
  render: () =>
    renderFieldWidgetStory({
      widget: buildFieldWidget({
        id: 'widget-emails-field',
        title: 'Emails',
        objectMetadataId: personObjectMetadataItem.id,
        fieldMetadataId: personEmailsField.id,
        fieldDisplayMode: FieldDisplayMode.FIELD,
      }),
      objectMetadataId: personObjectMetadataItem.id,
      targetRecord: personTargetRecord,
      records: personRecords,
    }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const email = await canvas.findByText(/jane\.smith@acme\.com/);
    expect(email).toBeVisible();
  },
};

export const PhonesFieldWidget: Story = {
  render: () =>
    renderFieldWidgetStory({
      widget: buildFieldWidget({
        id: 'widget-phones-field',
        title: 'Phones',
        objectMetadataId: personObjectMetadataItem.id,
        fieldMetadataId: personPhonesField.id,
        fieldDisplayMode: FieldDisplayMode.FIELD,
      }),
      objectMetadataId: personObjectMetadataItem.id,
      targetRecord: personTargetRecord,
      records: personRecords,
    }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const phone = await canvas.findByText(/555/);
    expect(phone).toBeVisible();
  },
};

export const SelectFieldWidget: Story = {
  render: () =>
    renderFieldWidgetStory({
      widget: buildFieldWidget({
        id: 'widget-select-field',
        title: 'Stage',
        objectMetadataId: opportunityObjectMetadataItem.id,
        fieldMetadataId: opportunityStageField.id,
        fieldDisplayMode: FieldDisplayMode.FIELD,
      }),
      objectMetadataId: opportunityObjectMetadataItem.id,
      targetRecord: opportunityTargetRecord,
      records: opportunityRecords,
    }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const stage = await canvas.findByText(/Proposal/);
    expect(stage).toBeVisible();
  },
};

export const MultiSelectFieldWidget: Story = {
  render: () =>
    renderFieldWidgetStory({
      widget: buildFieldWidget({
        id: 'widget-multi-select-field',
        title: 'Work Policy',
        objectMetadataId: companyObjectMetadataItem.id,
        fieldMetadataId: companyWorkPolicyField.id,
        fieldDisplayMode: FieldDisplayMode.FIELD,
      }),
      objectMetadataId: companyObjectMetadataItem.id,
      targetRecord: companyTargetRecord,
      records: companyRecords,
    }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const onSiteChip = await canvas.findByText(/On-Site/);
    expect(onSiteChip).toBeVisible();

    const hybridChip = await canvas.findByText(/Hybrid/);
    expect(hybridChip).toBeVisible();
  },
};

export const TimelineActivityRelationFieldWidget: Story = {
  render: () =>
    renderFieldWidgetStory({
      widget: buildFieldWidget({
        id: 'widget-timeline-activity-relation-field',
        title: 'Workspace Member',
        objectMetadataId: timelineActivityObjectMetadataItem.id,
        fieldMetadataId: timelineActivityWorkspaceMemberField.id,
        fieldDisplayMode: FieldDisplayMode.FIELD,
      }),
      objectMetadataId: timelineActivityObjectMetadataItem.id,
      targetRecord: timelineActivityTargetRecord,
      records: timelineActivityRecords,
    }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const workspaceMemberChip = await canvas.findByText('Sarah Johnson');
    expect(workspaceMemberChip).toBeVisible();
  },
};

export const ManyToOneRelationCardWidget: Story = {
  render: () =>
    renderFieldWidgetStory({
      widget: buildFieldWidget({
        id: 'widget-relation-card',
        title: 'Account Owner',
        objectMetadataId: companyObjectMetadataItem.id,
        fieldMetadataId: accountOwnerField.id,
        fieldDisplayMode: FieldDisplayMode.CARD,
      }),
      objectMetadataId: companyObjectMetadataItem.id,
      targetRecord: companyTargetRecord,
      records: companyRecordsWithAccountOwner,
    }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const accountOwnerChip = await canvas.findByText('John Doe');
    expect(accountOwnerChip).toBeVisible();

    const expandButton = await canvas.findByTestId('expand-button');
    await userEvent.click(expandButton);

    const lastUpdateField = await canvas.findByText('Last update');

    await waitFor(() => {
      expect(lastUpdateField).toBeVisible();
    });
  },
};

export const OneToManyRelationCardWidget: Story = {
  render: () =>
    renderFieldWidgetStory({
      widget: buildFieldWidget({
        id: 'widget-one-to-many-relation-card',
        title: 'People',
        objectMetadataId: companyObjectMetadataItem.id,
        fieldMetadataId: companyPeopleField.id,
        fieldDisplayMode: FieldDisplayMode.CARD,
      }),
      objectMetadataId: companyObjectMetadataItem.id,
      targetRecord: companyTargetRecord,
      records: companyRecordsWithPerson,
    }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const personChip = await canvas.findByText('Jane Smith');
    expect(personChip).toBeVisible();
  },
};

export const TimelineActivityRelationCardWidget: Story = {
  render: () =>
    renderFieldWidgetStory({
      widget: buildFieldWidget({
        id: 'widget-timeline-activity-relation-card',
        title: 'Workspace Member',
        objectMetadataId: timelineActivityObjectMetadataItem.id,
        fieldMetadataId: timelineActivityWorkspaceMemberField.id,
        fieldDisplayMode: FieldDisplayMode.CARD,
      }),
      objectMetadataId: timelineActivityObjectMetadataItem.id,
      targetRecord: timelineActivityTargetRecord,
      records: timelineActivityRecords,
    }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const workspaceMemberChip = await canvas.findByText('Sarah Johnson');
    expect(workspaceMemberChip).toBeVisible();

    const expandButton = await canvas.findByTestId('expand-button');
    await userEvent.click(expandButton);

    const lastUpdateField = await canvas.findByText('Last update');

    await waitFor(() => {
      expect(lastUpdateField).toBeVisible();
    });
  },
};

const generateMockPersonRecords = (count: number) => {
  const names = [
    { firstName: 'Jane', lastName: 'Smith' },
    { firstName: 'John', lastName: 'Williams' },
    { firstName: 'Alice', lastName: 'Brown' },
    { firstName: 'Bob', lastName: 'Davis' },
    { firstName: 'Carol', lastName: 'Miller' },
    { firstName: 'David', lastName: 'Wilson' },
    { firstName: 'Emma', lastName: 'Moore' },
    { firstName: 'Frank', lastName: 'Taylor' },
    { firstName: 'Grace', lastName: 'Anderson' },
    { firstName: 'Henry', lastName: 'Thomas' },
    { firstName: 'Ivy', lastName: 'Jackson' },
    { firstName: 'Jack', lastName: 'White' },
  ];

  return Array.from({ length: count }, (_, index) => {
    const nameInfo = names[index % names.length];
    const recordId = `person-${index + 1}`;
    return {
      id: recordId,
      __typename: 'Person',
      name: {
        __typename: 'FullName',
        firstName: nameInfo.firstName,
        lastName: `${nameInfo.lastName} ${index + 1}`,
      },
      emails: {
        __typename: 'Emails',
        primaryEmail: `${nameInfo.firstName.toLowerCase()}.${nameInfo.lastName.toLowerCase()}${index + 1}@example.com`,
        additionalEmails: [],
      },
      phones: {
        __typename: 'Phones',
        primaryPhoneNumber: `555000${(index + 1).toString().padStart(4, '0')}`,
        primaryPhoneCountryCode: '+1',
        primaryPhoneCallingCode: '+1',
        additionalPhones: [],
      },
    };
  });
};

export const OneToManyRelationCardWidgetWithProgressiveLoading: Story = {
  render: () => {
    const mockPeople = generateMockPersonRecords(12);
    const companyWithManyPeople = {
      ...mockCompanyRecord,
      people: mockPeople.map(({ id, __typename, name }) => ({
        __typename,
        id,
        name,
      })),
    };

    return renderFieldWidgetStory({
      widget: buildFieldWidget({
        id: 'widget-one-to-many-relation-card-progressive',
        title: 'People',
        objectMetadataId: companyObjectMetadataItem.id,
        fieldMetadataId: companyPeopleField.id,
        fieldDisplayMode: FieldDisplayMode.CARD,
      }),
      objectMetadataId: companyObjectMetadataItem.id,
      targetRecord: companyTargetRecord,
      records: [
        { id: TEST_RECORD_ID, record: companyWithManyPeople },
        ...mockPeople.map((person) => ({ id: person.id, record: person })),
      ],
    });
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const firstPerson = await canvas.findByText('Jane Smith 1');
    expect(firstPerson).toBeVisible();

    const fifthPerson = await canvas.findByText('Carol Miller 5');
    expect(fifthPerson).toBeVisible();

    expect(canvas.queryByText('David Wilson 6')).not.toBeInTheDocument();

    const moreButton = await canvas.findByTestId(
      'field-widget-show-more-button',
    );
    expect(moreButton).toBeVisible();
    expect(moreButton).toHaveTextContent('More (7)');

    await userEvent.click(moreButton);

    await waitFor(() => {
      const sixthPerson = canvas.getByText('David Wilson 6');
      expect(sixthPerson).toBeVisible();
    });

    const tenthPerson = await canvas.findByText('Henry Thomas 10');
    expect(tenthPerson).toBeVisible();

    const updatedMoreButton = await canvas.findByTestId(
      'field-widget-show-more-button',
    );
    expect(updatedMoreButton).toHaveTextContent('More (2)');

    await userEvent.click(updatedMoreButton);

    await waitFor(() => {
      const twelfthPerson = canvas.getByText('Jack White 12');
      expect(twelfthPerson).toBeVisible();
    });

    expect(
      canvas.queryByTestId('field-widget-show-more-button'),
    ).not.toBeInTheDocument();
  },
};
