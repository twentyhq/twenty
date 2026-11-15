import { mapFieldMetadataToGraphQLQuery } from '@/object-metadata/utils/mapFieldMetadataToGraphQLQuery';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';
import { CONNECTION_AGGREGATES_GQL_FIELDS_KEY } from '@/object-record/graphql/record-gql-fields/constants/ConnectionAggregatesGqlFieldsKey';
import { normalizeGQLField } from '~/testing/utils/normalizeGQLField';

const personObjectMetadataItem = getTestEnrichedObjectMetadataItemsMock().find(
  (item) => item.nameSingular === 'person',
);

const companyObjectMetadataItem = getTestEnrichedObjectMetadataItemsMock().find(
  (item) => item.nameSingular === 'company',
);

if (!personObjectMetadataItem || !companyObjectMetadataItem) {
  throw new Error('Object metadata not found');
}

describe('mapFieldMetadataToGraphQLQuery', () => {
  it('should return fieldName if simpleValue', async () => {
    const res = mapFieldMetadataToGraphQLQuery({
      objectMetadataItems: getTestEnrichedObjectMetadataItemsMock(),
      gqlField: 'id',
      fieldMetadata: personObjectMetadataItem.fields.find(
        (field) => field.name === 'id',
      )!,
      objectPermissionsByObjectMetadataId: {},
    });
    expect(normalizeGQLField(res)).toEqual(normalizeGQLField('id'));
  });
  it('should return fieldName if composite', async () => {
    const res = mapFieldMetadataToGraphQLQuery({
      objectMetadataItems: getTestEnrichedObjectMetadataItemsMock(),
      gqlField: 'name',
      fieldMetadata: personObjectMetadataItem.fields.find(
        (field) => field.name === 'name',
      )!,
      objectPermissionsByObjectMetadataId: {},
    });
    expect(normalizeGQLField(res)).toEqual(
      normalizeGQLField(`name
{
  firstName
  lastName
}`),
    );
  });

  it('should return non relation subFields if relation', async () => {
    const res = mapFieldMetadataToGraphQLQuery({
      objectMetadataItems: getTestEnrichedObjectMetadataItemsMock(),
      gqlField: 'company',
      fieldMetadata: personObjectMetadataItem.fields.find(
        (field) => field.name === 'company',
      )!,
      objectPermissionsByObjectMetadataId: {},
    });
    expect(normalizeGQLField(res)).toEqual(
      normalizeGQLField(`company
{
__typename
xLink
{
  primaryLinkUrl
  primaryLinkLabel
  secondaryLinks {
    label
    url
  }
}
linkedinLink
{
  primaryLinkUrl
  primaryLinkLabel
  secondaryLinks {
    label
    url
  }
}
domainName
{
  primaryLinkUrl
  primaryLinkLabel
  secondaryLinks {
    label
    url
  }
}
annualRecurringRevenue
{
  amountMicros
  currencyCode
}
createdAt
address
{
  addressStreet1
  addressStreet2
  addressCity
  addressState
  addressCountry
  addressPostcode
  addressLat
  addressLng
}
updatedAt
name
accountOwnerId
employees
id
idealCustomerProfile
}`),
    );
  });

  it('should return only return relation subFields that are in recordGqlFields', async () => {
    const res = mapFieldMetadataToGraphQLQuery({
      objectMetadataItems: getTestEnrichedObjectMetadataItemsMock(),
      relationRecordGqlFields: {
        accountOwner: { id: true, name: true },
        people: true,
        xLink: true,
        linkedinLink: true,
        domainName: {
          primaryLinkUrl: true,
          primaryLinkLabel: true,
          secondaryLinks: true,
        },
        annualRecurringRevenue: true,
        createdAt: true,
        address: { addressStreet1: true },
        updatedAt: true,
        name: true,
        accountOwnerId: true,
        employees: true,
        id: true,
        idealCustomerProfile: true,
      },
      gqlField: 'company',
      fieldMetadata: personObjectMetadataItem.fields.find(
        (field) => field.name === 'company',
      )!,
      objectPermissionsByObjectMetadataId: {},
    });
    expect(normalizeGQLField(res)).toEqual(
      normalizeGQLField(`company
{
__typename
xLink
{
  primaryLinkUrl
  primaryLinkLabel
  secondaryLinks {
    label
    url
  }
}
accountOwner
{
__typename
name
{
  firstName
  lastName
}
id
}
linkedinLink
{
  primaryLinkUrl
  primaryLinkLabel
  secondaryLinks {
    label
    url
  }
}
domainName
{
  primaryLinkUrl
  primaryLinkLabel
  secondaryLinks {
    label
    url
  }
}
annualRecurringRevenue
{
  amountMicros
  currencyCode
}
createdAt
address
{
  addressStreet1
  addressStreet2
  addressCity
  addressState
  addressCountry
  addressPostcode
  addressLat
  addressLng
}
updatedAt
people
{
  edges {
    node {
__typename
xLink
{
  primaryLinkUrl
  primaryLinkLabel
  secondaryLinks {
    label
    url
  }
}
id
createdAt
city
emails
{
  primaryEmail
  additionalEmails
}
jobTitle
name
{
  firstName
  lastName
}
phone
{
  primaryPhoneNumber
  primaryPhoneCountryCode
  primaryPhoneCallingCode
}
linkedinLink
{
  primaryLinkUrl
  primaryLinkLabel
  secondaryLinks {
    label
    url
  }
}
updatedAt
avatarUrl
companyId
}
  }
}
name
accountOwnerId
employees
id
idealCustomerProfile
}`),
    );
  });

  it('should select the requested aggregates on a one-to-many connection', () => {
    const res = mapFieldMetadataToGraphQLQuery({
      objectMetadataItems: getTestEnrichedObjectMetadataItemsMock(),
      relationRecordGqlFields: {
        id: true,
        [CONNECTION_AGGREGATES_GQL_FIELDS_KEY]: {
          totalCount: true,
          maxCreatedAt: true,
        },
      },
      gqlField: 'people',
      fieldMetadata: companyObjectMetadataItem.fields.find(
        (field) => field.name === 'people',
      )!,
      objectPermissionsByObjectMetadataId: {},
    });

    expect(normalizeGQLField(res)).toEqual(
      normalizeGQLField(`people
{
  totalCount
  maxCreatedAt
  edges {
    node {
__typename
id
}
  }
}`),
    );
  });
});

// todo @guillim add a test for the morph relation
