import { mapFieldMetadataToGraphQLQuery } from '@/object-metadata/utils/mapFieldMetadataToGraphQLQuery';
import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';
import { normalizeGQLField } from '~/utils/normalizeGQLField';

const personObjectMetadataItem = generatedMockObjectMetadataItems.find(
  (item) => item.nameSingular === 'person',
);

if (!personObjectMetadataItem) {
  throw new Error('ObjectMetadataItem not found');
}

describe('mapFieldMetadataToGraphQLQuery', () => {
  it('should return fieldName if simpleValue', async () => {
    const res = mapFieldMetadataToGraphQLQuery({
      objectMetadataItems: generatedMockObjectMetadataItems,
      field: personObjectMetadataItem.fields.find(
        (field) => field.name === 'id',
      )!,
    });
    expect(normalizeGQLField(res)).toEqual(normalizeGQLField('id'));
  });
  it('should return fieldName if composite', async () => {
    const res = mapFieldMetadataToGraphQLQuery({
      objectMetadataItems: generatedMockObjectMetadataItems,
      field: personObjectMetadataItem.fields.find(
        (field) => field.name === 'name',
      )!,
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
      objectMetadataItems: generatedMockObjectMetadataItems,
      field: personObjectMetadataItem.fields.find(
        (field) => field.name === 'company',
      )!,
    });
    expect(normalizeGQLField(res)).toEqual(
      normalizeGQLField(`company
{
__typename
xLink
{
  primaryLinkUrl
  primaryLinkLabel
  secondaryLinks
}
linkedinLink
{
  primaryLinkUrl
  primaryLinkLabel
  secondaryLinks
}
domainName
{
  primaryLinkUrl
  primaryLinkLabel
  secondaryLinks
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
      objectMetadataItems: generatedMockObjectMetadataItems,
      relationrecordFields: {
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
      field: personObjectMetadataItem.fields.find(
        (field) => field.name === 'company',
      )!,
    });
    expect(normalizeGQLField(res)).toEqual(
      normalizeGQLField(`company
{
__typename
xLink
{
  primaryLinkUrl
  primaryLinkLabel
  secondaryLinks
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
  secondaryLinks
}
domainName
{
  primaryLinkUrl
  primaryLinkLabel
  secondaryLinks
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
  secondaryLinks
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
  secondaryLinks
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
});
