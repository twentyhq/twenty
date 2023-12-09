import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

export const useGenerateEmptyRecord = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  // Todo fix typing once we generate the return base on Metadata
  const generateEmptyRecord = <T>(input: Partial<T> & { id: string }) => {
    // Todo replace this by runtime typing
    const validatedInput = input as { id: string } & { [key: string]: any };

    if (objectMetadataItem.nameSingular === 'company') {
      return {
        id: validatedInput.id,
        domainName: '',
        accountOwnerId: null,
        createdAt: new Date().toISOString(),
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
        updatedAt: new Date().toISOString(),
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
      } as T;
    }

    if (objectMetadataItem.nameSingular === 'person') {
      return {
        id: validatedInput.id,
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
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        city: '',
        linkedinLink: {
          label: '',
          url: '',
          __typename: 'Link',
        },
        __typename: 'Person',
      } as T;
    }

    if (objectMetadataItem.nameSingular === 'opportunity') {
      return {
        id: validatedInput.id,
        pipelineStepId: validatedInput.pipelineStepId,
        closeDate: null,
        updatedAt: new Date().toISOString(),
        pipelineStep: null,
        probability: '0',
        pointOfContactId: null,
        personId: null,
        amount: {
          amountMicros: null,
          currencyCode: null,
          __typename: 'Currency',
        },
        createdAt: new Date().toISOString(),
        pointOfContact: null,
        person: null,
        company: null,
        companyId: validatedInput.companyId,
        __typename: 'Opportunity',
      } as T;
    }

    if (objectMetadataItem.nameSingular === 'opportunity') {
      return {
        id: validatedInput.id,
        pipelineStepId: validatedInput.pipelineStepId,
        closeDate: null,
        updatedAt: new Date().toISOString(),
        pipelineStep: null,
        probability: '0',
        pointOfContactId: null,
        personId: null,
        amount: {
          amountMicros: null,
          currencyCode: null,
          __typename: 'Currency',
        },
        createdAt: new Date().toISOString(),
        pointOfContact: null,
        person: null,
        company: null,
        companyId: validatedInput.companyId,
        __typename: 'Opportunity',
      } as T;
    }
  };

  return {
    generateEmptyRecord: generateEmptyRecord,
  };
};
