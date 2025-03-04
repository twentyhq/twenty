import { generateDepthOneRecordGqlFields } from '@/object-record/graphql/utils/generateDepthOneRecordGqlFields';
import { getMockPersonObjectMetadataItem } from '~/testing/mock-data/people';

describe('generateDepthOneRecordGqlFields', () => {
  const objectMetadataItem = getMockPersonObjectMetadataItem();
  it('Should handle basic call with standalone objectMetadataItem', () => {
    const result = generateDepthOneRecordGqlFields({
      objectMetadataItem,
    });
    expect(result).toMatchInlineSnapshot(`
{
  "attachments": true,
  "avatarUrl": true,
  "calendarEventParticipants": true,
  "city": true,
  "company": true,
  "companyId": true,
  "createdAt": true,
  "createdBy": true,
  "deletedAt": true,
  "emails": true,
  "favorites": true,
  "id": true,
  "intro": true,
  "jobTitle": true,
  "linkedinLink": true,
  "messageParticipants": true,
  "name": true,
  "noteTargets": true,
  "performanceRating": true,
  "phones": true,
  "pointOfContactForOpportunities": true,
  "position": true,
  "searchVector": true,
  "taskTargets": true,
  "timelineActivities": true,
  "updatedAt": true,
  "whatsapp": true,
  "workPreference": true,
  "xLink": true,
}
`);
  });
});
