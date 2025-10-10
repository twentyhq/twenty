import { generateDepthRecordGqlFieldsFromObject } from '@/object-record/graphql/record-gql-fields/utils/generateDepthRecordGqlFieldsFromObject';
import { getMockPersonObjectMetadataItem } from '~/testing/mock-data/people';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';

describe('generateDepthOneRecordGqlFields', () => {
  const objectMetadataItem = getMockPersonObjectMetadataItem();
  it('Should handle basic call with standalone objectMetadataItem', () => {
    const result = generateDepthRecordGqlFieldsFromObject({
      objectMetadataItem,
      objectMetadataItems: generatedMockObjectMetadataItems,
      depth: 1,
    });
    expect(result).toMatchInlineSnapshot(`
{
  "attachments": {
    "id": true,
    "name": true,
  },
  "avatarUrl": true,
  "calendarEventParticipants": {
    "handle": true,
    "id": true,
  },
  "city": true,
  "company": {
    "domainName": true,
    "id": true,
    "name": true,
  },
  "companyId": true,
  "createdAt": true,
  "createdBy": true,
  "deletedAt": true,
  "emails": true,
  "favorites": {
    "id": true,
  },
  "id": true,
  "intro": true,
  "jobTitle": true,
  "linkedinLink": true,
  "messageParticipants": {
    "handle": true,
    "id": true,
  },
  "name": true,
  "noteTargets": {
    "id": true,
  },
  "performanceRating": true,
  "phones": true,
  "pointOfContactForOpportunities": {
    "id": true,
    "name": true,
  },
  "position": true,
  "searchVector": true,
  "taskTargets": {
    "id": true,
  },
  "timelineActivities": {
    "id": true,
  },
  "updatedAt": true,
  "whatsapp": true,
  "workPreference": true,
  "xLink": true,
}
`);
  });
});
