import { type Meta, type StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { MemoryRouter } from 'react-router-dom';
import { type MutableSnapshot } from 'recoil';

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
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { FieldWidget } from '@/page-layout/widgets/field/components/FieldWidget';
import { assertFieldWidgetOrThrow } from '@/page-layout/widgets/field/utils/assertFieldWidgetOrThrow';
import { LayoutRenderingProvider } from '@/ui/layout/contexts/LayoutRenderingContext';
import { ComponentDecorator } from 'twenty-ui/testing';
import { PageLayoutType, WidgetType } from '~/generated-metadata/graphql';
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

const meta: Meta<typeof FieldWidget> = {
  title: 'Modules/PageLayout/Widgets/FieldWidget',
  component: FieldWidget,
  decorators: [
    ComponentDecorator,
    ChipGeneratorsDecorator,
    I18nFrontDecorator,
    (Story, context) => {
      assertFieldWidgetOrThrow(context.args.widget);

      const fieldMetadataId = context.args.widget.configuration.fieldMetadataId;
      const fieldMetadataItem = [
        nameField,
        addressField,
        employeesField,
        linkedinField,
        accountOwnerField,
        idealCustomerProfileField,
        annualRecurringRevenueField,
        personEmailsField,
        personPhonesField,
        opportunityStageField,
        companyWorkPolicyField,
        companyPeopleField,
        timelineActivityWorkspaceMemberField,
      ].find((field) => field.id === fieldMetadataId);

      // Determine which object and record to use based on the field
      const isPersonField = [personEmailsField, personPhonesField].some(
        (field) => field.id === fieldMetadataId,
      );
      const isOpportunityField = [opportunityStageField].some(
        (field) => field.id === fieldMetadataId,
      );
      const isTimelineActivityField = [
        timelineActivityWorkspaceMemberField,
      ].some((field) => field.id === fieldMetadataId);
      const objectMetadataItem = isPersonField
        ? personObjectMetadataItem
        : isOpportunityField
          ? opportunityObjectMetadataItem
          : isTimelineActivityField
            ? timelineActivityObjectMetadataItem
            : companyObjectMetadataItem;
      const mockRecord = isPersonField
        ? mockPersonRecord
        : isOpportunityField
          ? mockOpportunityRecord
          : isTimelineActivityField
            ? mockTimelineActivityRecord
            : mockCompanyRecord;
      const recordId = isPersonField
        ? TEST_PERSON_RECORD_ID
        : isOpportunityField
          ? TEST_OPPORTUNITY_RECORD_ID
          : isTimelineActivityField
            ? TEST_TIMELINE_ACTIVITY_RECORD_ID
            : TEST_RECORD_ID;

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
            objectMetadataId: objectMetadataItem.id,
            tabs: [],
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            deletedAt: null,
          },
        );

        // Set the record with the appropriate field value
        snapshot.set(recordStoreFamilyState(recordId), {
          ...mockRecord,
          [fieldMetadataItem?.name ?? '']:
            mockRecord[fieldMetadataItem?.name as keyof typeof mockRecord],
        });

        // Set the related WorkspaceMember record for relation field display
        if (
          !isPersonField &&
          mockCompanyRecord.accountOwner !== null &&
          mockCompanyRecord.accountOwner !== undefined
        ) {
          snapshot.set(
            recordStoreFamilyState(mockCompanyRecord.accountOwner.id),
            mockCompanyRecord.accountOwner,
          );
        }

        // Set the related Person record for ONE_TO_MANY relation display
        if (!isPersonField && !isOpportunityField && !isTimelineActivityField) {
          snapshot.set(
            recordStoreFamilyState(TEST_PERSON_RECORD_ID),
            mockPersonRecord,
          );
        }

        // Set the related WorkspaceMember record for TimelineActivity relation display
        if (isTimelineActivityField) {
          snapshot.set(
            recordStoreFamilyState('test-workspace-member-xyz'),
            mockWorkspaceMemberRecord,
          );
        }
      };

      return (
        <MemoryRouter>
          <JestMetadataAndApolloMocksWrapper>
            <PageLayoutTestWrapper initializeState={initializeState}>
              <LayoutRenderingProvider
                value={{
                  isInRightDrawer: false,
                  layoutType: PageLayoutType.RECORD_PAGE,
                  targetRecordIdentifier: {
                    id: recordId,
                    targetObjectNameSingular: objectMetadataItem.nameSingular,
                  },
                }}
              >
                <PageLayoutContentProvider
                  value={{
                    layoutMode: 'vertical-list',
                    tabId: 'fields',
                  }}
                >
                  <Story />
                </PageLayoutContentProvider>
              </LayoutRenderingProvider>
            </PageLayoutTestWrapper>
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
      description: 'Widget configuration',
    },
  },
};

export default meta;
type Story = StoryObj<typeof FieldWidget>;

export const TextFieldWidget: Story = {
  args: {
    widget: {
      __typename: 'PageLayoutWidget',
      id: 'widget-text-field',
      pageLayoutTabId: 'tab-overview',
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
        fieldMetadataId: nameField.id,
        layout: 'FIELD',
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      deletedAt: null,
    } as PageLayoutWidget,
  },
  render: (args) => (
    <div style={{ width: '400px', padding: '20px' }}>
      <FieldWidget widget={args.widget} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const companyName = await canvas.findByText('Acme Corporation');
    expect(companyName).toBeVisible();
  },
};

export const AddressFieldWidget: Story = {
  args: {
    widget: {
      __typename: 'PageLayoutWidget',
      id: 'widget-address-field',
      pageLayoutTabId: 'tab-overview',
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
        fieldMetadataId: addressField.id,
        layout: 'FIELD',
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      deletedAt: null,
    } as PageLayoutWidget,
  },
  render: (args) => (
    <div style={{ width: '400px', padding: '20px' }}>
      <FieldWidget widget={args.widget} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const street = await canvas.findByText(/123 Business St/i);
    expect(street).toBeVisible();

    const city = await canvas.findByText(/San Francisco/i);
    expect(city).toBeVisible();
  },
};

export const NumberFieldWidget: Story = {
  args: {
    widget: {
      __typename: 'PageLayoutWidget',
      id: 'widget-number-field',
      pageLayoutTabId: 'tab-overview',
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
        fieldMetadataId: employeesField.id,
        layout: 'FIELD',
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      deletedAt: null,
    } as PageLayoutWidget,
  },
  render: (args) => (
    <div style={{ width: '400px', padding: '20px' }}>
      <FieldWidget widget={args.widget} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const employeeCount = await canvas.findByText('250');
    expect(employeeCount).toBeVisible();
  },
};

export const LinkFieldWidget: Story = {
  args: {
    widget: {
      __typename: 'PageLayoutWidget',
      id: 'widget-link-field',
      pageLayoutTabId: 'tab-overview',
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
        fieldMetadataId: linkedinField.id,
        layout: 'FIELD',
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      deletedAt: null,
    } as PageLayoutWidget,
  },
  render: (args) => (
    <div style={{ width: '400px', padding: '20px' }}>
      <FieldWidget widget={args.widget} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const linkedinLink = await canvas.findByText(/acme/i);
    expect(linkedinLink).toBeVisible();
  },
};

export const ManyToOneRelationFieldWidget: Story = {
  args: {
    widget: {
      __typename: 'PageLayoutWidget',
      id: 'widget-relation-field',
      pageLayoutTabId: 'tab-overview',
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
        fieldMetadataId: accountOwnerField.id,
        layout: 'FIELD',
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      deletedAt: null,
    } as PageLayoutWidget,
  },
  render: (args) => (
    <div style={{ width: '400px', padding: '20px' }}>
      <FieldWidget widget={args.widget} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const accountOwner = await canvas.findByText('John Doe');
    expect(accountOwner).toBeVisible();
  },
};

export const OneToManyRelationFieldWidget: Story = {
  args: {
    widget: {
      __typename: 'PageLayoutWidget',
      id: 'widget-one-to-many-relation-field',
      pageLayoutTabId: 'tab-overview',
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
        fieldMetadataId: companyPeopleField.id,
        layout: 'FIELD',
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      deletedAt: null,
    } as PageLayoutWidget,
  },
  render: (args) => (
    <div style={{ width: '400px', padding: '20px' }}>
      <FieldWidget widget={args.widget} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const personChip = await canvas.findByText('Jane Smith');
    expect(personChip).toBeVisible();
  },
};

export const BooleanFieldWidget: Story = {
  args: {
    widget: {
      __typename: 'PageLayoutWidget',
      id: 'widget-boolean-field',
      pageLayoutTabId: 'tab-overview',
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
        fieldMetadataId: idealCustomerProfileField.id,
        layout: 'FIELD',
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      deletedAt: null,
    } as PageLayoutWidget,
  },
  render: (args) => (
    <div style={{ width: '400px', padding: '20px' }}>
      <FieldWidget widget={args.widget} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('True')).toBeVisible();
  },
};

export const CurrencyFieldWidget: Story = {
  args: {
    widget: {
      __typename: 'PageLayoutWidget',
      id: 'widget-currency-field',
      pageLayoutTabId: 'tab-overview',
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
        fieldMetadataId: annualRecurringRevenueField.id,
        layout: 'FIELD',
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      deletedAt: null,
    } as PageLayoutWidget,
  },
  render: (args) => (
    <div style={{ width: '400px', padding: '20px' }}>
      <FieldWidget widget={args.widget} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('5m')).toBeVisible();
  },
};

export const EmailsFieldWidget: Story = {
  args: {
    widget: {
      __typename: 'PageLayoutWidget',
      id: 'widget-emails-field',
      pageLayoutTabId: 'tab-overview',
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
        fieldMetadataId: personEmailsField.id,
        layout: 'FIELD',
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      deletedAt: null,
    } as PageLayoutWidget,
  },
  render: (args) => (
    <div style={{ width: '400px', padding: '20px' }}>
      <FieldWidget widget={args.widget} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const email = await canvas.findByText(/jane\.smith@acme\.com/);
    expect(email).toBeVisible();
  },
};

export const PhonesFieldWidget: Story = {
  args: {
    widget: {
      __typename: 'PageLayoutWidget',
      id: 'widget-phones-field',
      pageLayoutTabId: 'tab-overview',
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
        fieldMetadataId: personPhonesField.id,
        layout: 'FIELD',
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      deletedAt: null,
    } as PageLayoutWidget,
  },
  render: (args) => (
    <div style={{ width: '400px', padding: '20px' }}>
      <FieldWidget widget={args.widget} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const phone = await canvas.findByText(/555/);
    expect(phone).toBeVisible();
  },
};

export const SelectFieldWidget: Story = {
  args: {
    widget: {
      __typename: 'PageLayoutWidget',
      id: 'widget-select-field',
      pageLayoutTabId: 'tab-overview',
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
        fieldMetadataId: opportunityStageField.id,
        layout: 'FIELD',
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      deletedAt: null,
    } as PageLayoutWidget,
  },
  render: (args) => (
    <div style={{ width: '400px', padding: '20px' }}>
      <FieldWidget widget={args.widget} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Select field displays the selected option label
    const stage = await canvas.findByText(/Proposal/);
    expect(stage).toBeVisible();
  },
};

export const MultiSelectFieldWidget: Story = {
  args: {
    widget: {
      __typename: 'PageLayoutWidget',
      id: 'widget-multi-select-field',
      pageLayoutTabId: 'tab-overview',
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
        fieldMetadataId: companyWorkPolicyField.id,
        layout: 'FIELD',
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      deletedAt: null,
    } as PageLayoutWidget,
  },
  render: (args) => (
    <div style={{ width: '400px', padding: '20px' }}>
      <FieldWidget widget={args.widget} />
    </div>
  ),
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
  args: {
    widget: {
      __typename: 'PageLayoutWidget',
      id: 'widget-timeline-activity-relation-field',
      pageLayoutTabId: 'tab-overview',
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
        fieldMetadataId: timelineActivityWorkspaceMemberField.id,
        layout: 'FIELD',
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      deletedAt: null,
    } as PageLayoutWidget,
  },
  render: (args) => (
    <div style={{ width: '400px', padding: '20px' }}>
      <FieldWidget widget={args.widget} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // MANY_TO_ONE relation from TimelineActivity to WorkspaceMember
    const workspaceMemberChip = await canvas.findByText('Sarah Johnson');
    expect(workspaceMemberChip).toBeVisible();
  },
};
