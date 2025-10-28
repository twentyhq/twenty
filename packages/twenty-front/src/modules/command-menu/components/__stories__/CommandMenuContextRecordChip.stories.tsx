import { gql } from '@apollo/client';
import { type Decorator, type Meta, type StoryObj } from '@storybook/react';

import { CommandMenuContextRecordsChip } from '@/command-menu/components/CommandMenuContextRecordsChip';
import { PreComputedChipGeneratorsContext } from '@/object-metadata/contexts/PreComputedChipGeneratorsContext';
import { type RecordChipData } from '@/object-record/record-field/ui/types/RecordChipData';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { ComponentDecorator } from 'twenty-ui/testing';
import { getJestMetadataAndApolloMocksAndActionMenuWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksAndActionMenuWrapper';
import { getCompaniesMock } from '~/testing/mock-data/companies';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';

const FIND_MANY_COMPANIES = gql`
  query FindManyCompanies(
    $filter: CompanyFilterInput
    $orderBy: [CompanyOrderByInput]
    $lastCursor: String
    $limit: Int
  ) {
    companies(
      filter: $filter
      orderBy: $orderBy
      first: $limit
      after: $lastCursor
    ) {
      edges {
        node {
          __typename
          accountOwnerId
          address {
            addressStreet1
            addressStreet2
            addressCity
            addressState
            addressCountry
            addressPostcode
            addressLat
            addressLng
          }
          annualRecurringRevenue {
            amountMicros
            currencyCode
          }
          createdAt
          createdBy {
            source
            workspaceMemberId
            name
            context
          }
          deletedAt
          domainName {
            primaryLinkUrl
            primaryLinkLabel
            secondaryLinks
          }
          employees
          id
          idealCustomerProfile
          introVideo {
            primaryLinkUrl
            primaryLinkLabel
            secondaryLinks
          }
          linkedinLink {
            primaryLinkUrl
            primaryLinkLabel
            secondaryLinks
          }
          name
          position
          tagline
          updatedAt
          visaSponsorship
          workPolicy
          xLink {
            primaryLinkUrl
            primaryLinkLabel
            secondaryLinks
          }
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
`;

const companyMockObjectMetadataItem = generatedMockObjectMetadataItems.find(
  (item) => item.nameSingular === 'company',
);

const companiesMock = getCompaniesMock();

const companyMock = companiesMock[0];

const chipGeneratorPerObjectPerField: Record<
  string,
  Record<string, (record: ObjectRecord) => RecordChipData>
> = {
  company: {
    name: (record: ObjectRecord): RecordChipData => ({
      recordId: record.id,
      name: record.name as string,
      avatarUrl: '',
      avatarType: 'rounded',
      isLabelIdentifier: true,
      objectNameSingular: 'company',
    }),
  },
};

const identifierChipGeneratorPerObject: Record<
  string,
  (record: ObjectRecord) => RecordChipData
> = {
  company: chipGeneratorPerObjectPerField.company.name,
};

const ChipGeneratorsDecorator: Decorator = (Story) => (
  <PreComputedChipGeneratorsContext.Provider
    value={{
      chipGeneratorPerObjectPerField,
      identifierChipGeneratorPerObject,
    }}
  >
    <Story />
  </PreComputedChipGeneratorsContext.Provider>
);

const createContextStoreWrapper = ({
  companies,
  componentInstanceId,
}: {
  companies: typeof companiesMock;
  componentInstanceId: string;
}) => {
  return getJestMetadataAndApolloMocksAndActionMenuWrapper({
    apolloMocks: [
      {
        request: {
          query: FIND_MANY_COMPANIES,
          variables: {
            filter: {
              id: { in: companies.map((company) => company.id) },
              deletedAt: { is: 'NOT_NULL' },
            },
            orderBy: [{ position: 'AscNullsFirst' }],
            limit: 3,
          },
        },
        result: {
          data: {
            companies: {
              edges: companies.slice(0, 3).map((company, index) => ({
                node: company,
                cursor: `cursor-${index + 1}`,
              })),
              pageInfo: {
                hasNextPage: companies.length > 3,
                hasPreviousPage: false,
                startCursor: 'cursor-1',
                endCursor:
                  companies.length > 0
                    ? `cursor-${Math.min(companies.length, 3)}`
                    : null,
              },
              totalCount: companies.length,
            },
          },
        },
      },
    ],
    componentInstanceId,
    contextStoreCurrentObjectMetadataNameSingular:
      companyMockObjectMetadataItem?.nameSingular,
    contextStoreTargetedRecordsRule: {
      mode: 'selection',
      selectedRecordIds: companies.map((company) => company.id),
    },
    contextStoreNumberOfSelectedRecords: companies.length,
    onInitializeRecoilSnapshot: (snapshot) => {
      for (const company of companies) {
        snapshot.set(recordStoreFamilyState(company.id), company);
      }
    },
  });
};

const ContextStoreDecorator: Decorator = (Story) => {
  const ContextStoreWrapper = createContextStoreWrapper({
    companies: [companyMock],
    componentInstanceId: '1',
  });

  return (
    <ContextStoreWrapper>
      <Story />
    </ContextStoreWrapper>
  );
};

const meta: Meta<typeof CommandMenuContextRecordsChip> = {
  title: 'Modules/CommandMenu/CommandMenuContextRecordChip',
  component: CommandMenuContextRecordsChip,
  decorators: [
    ContextStoreDecorator,
    ChipGeneratorsDecorator,
    ComponentDecorator,
  ],
  args: {
    objectMetadataItemId: companyMockObjectMetadataItem?.id,
  },
};

export default meta;
type Story = StoryObj<typeof CommandMenuContextRecordsChip>;

export const Default: Story = {};

export const WithTwoCompanies: Story = {
  decorators: [
    (Story) => {
      const twoCompaniesMock = companiesMock.slice(0, 2);
      const TwoCompaniesWrapper = createContextStoreWrapper({
        companies: twoCompaniesMock,
        componentInstanceId: '2',
      });

      return (
        <TwoCompaniesWrapper>
          <Story />
        </TwoCompaniesWrapper>
      );
    },
  ],
};

export const WithTenCompanies: Story = {
  decorators: [
    (Story) => {
      const tenCompaniesMock = companiesMock.slice(0, 10);
      const TenCompaniesWrapper = createContextStoreWrapper({
        companies: tenCompaniesMock,
        componentInstanceId: '3',
      });

      return (
        <TenCompaniesWrapper>
          <Story />
        </TenCompaniesWrapper>
      );
    },
  ],
};
