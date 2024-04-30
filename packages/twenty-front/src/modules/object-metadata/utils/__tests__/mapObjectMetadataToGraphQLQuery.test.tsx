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
  it('should query only specified recordGqlFields', async () => {
    const res = mapObjectMetadataToGraphQLQuery({
      objectMetadataItems: mockObjectMetadataItems,
      objectMetadataItem: personObjectMetadataItem,
      recordGqlFields: {
        company: true,
        xLink: true,
        id: true,
        createdAt: true,
        city: true,
        email: true,
        jobTitle: true,
        name: true,
        phone: true,
        linkedinLink: true,
        updatedAt: true,
        avatarUrl: true,
        companyId: true,
      },
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

  it('should load only specified operation fields nested', async () => {
    const res = mapObjectMetadataToGraphQLQuery({
      objectMetadataItems: mockObjectMetadataItems,
      objectMetadataItem: personObjectMetadataItem,
      recordGqlFields: { company: { id: true }, id: true, name: true },
    });
    expect(formatGQLString(res)).toEqual(`{
__typename
id
company
{
__typename
id
}
name
{
  firstName
  lastName
}
}`);
  });
});
