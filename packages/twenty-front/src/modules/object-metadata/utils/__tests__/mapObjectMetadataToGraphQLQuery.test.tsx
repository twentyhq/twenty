import { getObjectMetadataItemsMock } from '@/object-metadata/utils/getObjectMetadataItemsMock';
import { mapObjectMetadataToGraphQLQuery } from '@/object-metadata/utils/mapObjectMetadataToGraphQLQuery';

const mockObjectMetadataItems = getObjectMetadataItemsMock();

const formatGQLString = (inputString: string) =>
  inputString.replace(/^\s*[\r\n]/gm, '');

const personObjectMetadataItem = mockObjectMetadataItems.find(
  (item) => item.nameSingular === 'person',
);

if (!personObjectMetadataItem) {
  throw new Error('ObjectMetadataItem not found');
}

describe('mapObjectMetadataToGraphQLQuery', () => {
  it('should return typename if depth < 0', async () => {
    const res = mapObjectMetadataToGraphQLQuery({
      objectMetadataItems: mockObjectMetadataItems,
      objectMetadataItem: personObjectMetadataItem,
      depth: -1,
    });
    expect(formatGQLString(res)).toEqual(`{
__typename
}`);
  });

  it('should return depth 0 if depth = 0', async () => {
    const res = mapObjectMetadataToGraphQLQuery({
      objectMetadataItems: mockObjectMetadataItems,
      objectMetadataItem: personObjectMetadataItem,
      depth: 0,
    });
    expect(formatGQLString(res)).toEqual(`{
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
}`);
  });

  it('should return depth 1 if depth = 1', async () => {
    const res = mapObjectMetadataToGraphQLQuery({
      objectMetadataItems: mockObjectMetadataItems,
      objectMetadataItem: personObjectMetadataItem,
      depth: 1,
    });
    expect(formatGQLString(res)).toEqual(`{
__typename
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
xLink
{
  label
  url
}
id
pointOfContactForOpportunities
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
createdAt
company
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
}
city
email
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
jobTitle
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
}`);
  });

  it('should eager load only specified relations', async () => {
    const res = mapObjectMetadataToGraphQLQuery({
      objectMetadataItems: mockObjectMetadataItems,
      objectMetadataItem: personObjectMetadataItem,
      eagerLoadedRelations: { company: true },
      depth: 1,
    });
    expect(formatGQLString(res)).toEqual(`{
__typename
xLink
{
  label
  url
}
id
createdAt
company
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
}
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
}`);
  });
});
