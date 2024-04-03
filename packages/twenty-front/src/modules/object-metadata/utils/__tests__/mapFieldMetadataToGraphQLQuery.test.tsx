import { getObjectMetadataItemsMock } from '@/object-metadata/utils/getObjectMetadataItemsMock';
import { mapFieldMetadataToGraphQLQuery } from '@/object-metadata/utils/mapFieldMetadataToGraphQLQuery';

const mockObjectMetadataItems = getObjectMetadataItemsMock();

const formatGQLString = (inputString: string) =>
  inputString.replace(/^\s*[\r\n]/gm, '');

const personObjectMetadataItem = mockObjectMetadataItems.find(
  (item) => item.nameSingular === 'person',
);

if (!personObjectMetadataItem) {
  throw new Error('ObjectMetadataItem not found');
}

describe('mapFieldMetadataToGraphQLQuery', () => {
  it('should return fieldName if simpleValue', async () => {
    const res = mapFieldMetadataToGraphQLQuery({
      objectMetadataItems: mockObjectMetadataItems,
      field: personObjectMetadataItem.fields.find(
        (field) => field.name === 'id',
      )!,
    });
    expect(formatGQLString(res)).toEqual('id');
  });
  it('should return fieldName if composite', async () => {
    const res = mapFieldMetadataToGraphQLQuery({
      objectMetadataItems: mockObjectMetadataItems,
      field: personObjectMetadataItem.fields.find(
        (field) => field.name === 'name',
      )!,
    });
    expect(formatGQLString(res)).toEqual(`name
{
  firstName
  lastName
}`);
  });
  it('should not return relation if depth is < 1', async () => {
    const res = mapFieldMetadataToGraphQLQuery({
      objectMetadataItems: mockObjectMetadataItems,
      depth: 0,
      field: personObjectMetadataItem.fields.find(
        (field) => field.name === 'company',
      )!,
    });
    expect(formatGQLString(res)).toEqual('');
  });

  it('should return relation if it matches depth', async () => {
    const res = mapFieldMetadataToGraphQLQuery({
      objectMetadataItems: mockObjectMetadataItems,
      depth: 1,
      field: personObjectMetadataItem.fields.find(
        (field) => field.name === 'company',
      )!,
    });
    expect(formatGQLString(res)).toEqual(`company
{
__typename
xLink
{
  label
  url
}
linkedinLink
{
  label
  url
}
domainName
annualRecurringRevenue
{
  amountMicros
  currencyCode
}
createdAt
address
updatedAt
name
accountOwnerId
employees
id
idealCustomerProfile
}`);
  });
  it('should return relation with all sub relations if it matches depth', async () => {
    const res = mapFieldMetadataToGraphQLQuery({
      objectMetadataItems: mockObjectMetadataItems,
      depth: 2,
      field: personObjectMetadataItem.fields.find(
        (field) => field.name === 'company',
      )!,
    });
    expect(formatGQLString(res)).toEqual(`company
{
__typename
xLink
{
  label
  url
}
accountOwner
{
__typename
colorScheme
name
{
  firstName
  lastName
}
locale
userId
avatarUrl
createdAt
updatedAt
id
}
linkedinLink
{
  label
  url
}
attachments
{
  edges {
    node {
__typename
updatedAt
createdAt
name
personId
activityId
companyId
id
authorId
type
fullPath
}
  }
}
domainName
opportunities
{
  edges {
    node {
__typename
personId
pointOfContactId
updatedAt
companyId
probability
closeDate
amount
{
  amountMicros
  currencyCode
}
id
createdAt
}
  }
}
annualRecurringRevenue
{
  amountMicros
  currencyCode
}
createdAt
address
updatedAt
activityTargets
{
  edges {
    node {
__typename
updatedAt
createdAt
personId
activityId
companyId
id
}
  }
}
favorites
{
  edges {
    node {
__typename
id
companyId
createdAt
personId
position
workspaceMemberId
updatedAt
}
  }
}
people
{
  edges {
    node {
__typename
xLink
{
  label
  url
}
id
createdAt
city
email
jobTitle
name
{
  firstName
  lastName
}
phone
linkedinLink
{
  label
  url
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
}`);
  });

  it('should return GraphQL fields based on queryFields', async () => {
    const res = mapFieldMetadataToGraphQLQuery({
      objectMetadataItems: mockObjectMetadataItems,
      depth: 2,
      queryFields: {
        accountOwner: true,
        people: true,
        xLink: true,
        linkedinLink: true,
        domainName: true,
        annualRecurringRevenue: true,
        createdAt: true,
        address: true,
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
    expect(formatGQLString(res)).toEqual(`company
{
__typename
xLink
{
  label
  url
}
accountOwner
{
__typename
colorScheme
name
{
  firstName
  lastName
}
locale
userId
avatarUrl
createdAt
updatedAt
id
}
linkedinLink
{
  label
  url
}
domainName
annualRecurringRevenue
{
  amountMicros
  currencyCode
}
createdAt
address
updatedAt
people
{
  edges {
    node {
__typename
xLink
{
  label
  url
}
id
createdAt
city
email
jobTitle
name
{
  firstName
  lastName
}
phone
linkedinLink
{
  label
  url
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
}`);
  });
});
