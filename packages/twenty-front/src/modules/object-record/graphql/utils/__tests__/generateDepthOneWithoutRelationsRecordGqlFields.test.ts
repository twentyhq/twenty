import { generateDepthOneWithoutRelationsRecordGqlFields } from '@/object-record/graphql/utils/generateDepthOneWithoutRelationsRecordGqlFields';
import { getMockPersonObjectMetadataItem } from '~/testing/mock-data/people';

describe('generateDepthOneWithoutRelationsRecordGqlFields', () => {
  const objectMetadataItem = getMockPersonObjectMetadataItem();
  it('Should handle basic call with standalone objectMetadataItem', () => {
    const result = generateDepthOneWithoutRelationsRecordGqlFields({
      objectMetadataItem,
    });
    expect(result).toMatchInlineSnapshot(`
{
  "avatarUrl": true,
  "city": true,
  "createdAt": true,
  "createdBy": true,
  "deletedAt": true,
  "emails": true,
  "id": true,
  "jobTitle": true,
  "linkedinLink": true,
  "name": true,
  "phones": true,
  "position": true,
  "searchVector": true,
  "updatedAt": true,
  "xLink": true,
}
`);
  });
});
