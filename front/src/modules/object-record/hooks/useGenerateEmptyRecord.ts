import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

export const useGenerateEmptyRecord = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const generateEmptyRecord = (id: string) => {
    if (objectMetadataItem.nameSingular === 'company') {
      return {
        id,
        domainName: '',
        accountOwnerId: null,
        createdAt: '2023-12-05T16:04:42.261Z',
        address: '',
        people: [
          {
            edges: [],
            __typename: 'PersonConnection',
          },
        ],
        xLink: {
          label: '',
          url: '',
          __typename: 'Link',
        },
        attachments: {
          edges: [],
          __typename: 'AttachmentConnection',
        },
        activityTargets: {
          edges: [],
          __typename: 'ActivityTargetConnection',
        },
        idealCustomerProfile: null,
        annualRecurringRevenue: {
          amountMicros: null,
          currencyCode: null,
          __typename: 'Currency',
        },
        updatedAt: '2023-12-05T16:04:42.261Z',
        employees: null,
        accountOwner: null,
        name: '',
        linkedinLink: {
          label: '',
          url: '',
          __typename: 'Link',
        },
        favorites: {
          edges: [],
          __typename: 'FavoriteConnection',
        },
        opportunities: {
          edges: [],
          __typename: 'OpportunityConnection',
        },
        __typename: 'Company',
      };
    }

    if (objectMetadataItem.nameSingular === 'person') {
      return {
        id,
        activityTargets: {
          edges: [],
          __typename: 'ActivityTargetConnection',
        },
        opportunities: {
          edges: [],
          __typename: 'OpportunityConnection',
        },
        companyId: null,
        favorites: {
          edges: [],
          __typename: 'FavoriteConnection',
        },
        phone: '',
        company: null,
        xLink: {
          label: '',
          url: '',
          __typename: 'Link',
        },
        jobTitle: '',
        pointOfContactForOpportunities: {
          edges: [],
          __typename: 'OpportunityConnection',
        },
        email: '',
        attachments: {
          edges: [],
          __typename: 'AttachmentConnection',
        },
        name: {
          firstName: '',
          lastName: '',
          __typename: 'FullName',
        },
        avatarUrl: '',
        updatedAt: '2023-12-05T16:45:11.840Z',
        createdAt: '2023-12-05T16:45:11.840Z',
        city: '',
        linkedinLink: {
          label: '',
          url: '',
          __typename: 'Link',
        },
        __typename: 'Person',
      };
    }

    if (objectMetadataItem.nameSingular === 'opportunity') {
      return {
        id,
        pipelineStepId: '30b14887-d592-427d-bd97-6e670158db02',
        closeDate: null,
        companyId: '04b2e9f5-0713-40a5-8216-82802401d33e',
        updatedAt: '2023-12-05T16:46:27.621Z',
        pipelineStep: {
          id: '30b14887-d592-427d-bd97-6e670158db02',
          position: 2,
          name: 'Meeting',
          updatedAt: '2023-12-05T11:29:21.485Z',
          createdAt: '2023-12-05T11:29:21.485Z',
          color: 'sky',
          __typename: 'PipelineStep',
        },
        probability: '0',
        pointOfContactId: null,
        personId: null,
        amount: {
          amountMicros: null,
          currencyCode: null,
          __typename: 'Currency',
        },
        createdAt: '2023-12-05T16:46:27.621Z',
        pointOfContact: null,
        person: null,
        company: {
          id: '04b2e9f5-0713-40a5-8216-82802401d33e',
          domainName: 'qonto.com',
          accountOwnerId: null,
          createdAt: '2023-12-05T11:29:21.484Z',
          address: '',
          xLink: {
            label: '',
            url: '',
            __typename: 'Link',
          },
          idealCustomerProfile: null,
          annualRecurringRevenue: {
            amountMicros: null,
            currencyCode: null,
            __typename: 'Currency',
          },
          updatedAt: '2023-12-05T11:29:21.484Z',
          employees: null,
          name: 'Qonto',
          linkedinLink: {
            label: '',
            url: '',
            __typename: 'Link',
          },
          __typename: 'Company',
        },
        __typename: 'Opportunity',
      };
    }

    return {};
  };

  return {
    generateEmptyRecord: generateEmptyRecord,
  };
};
