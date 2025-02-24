import { generateDepthOneRecordGqlFields } from '@/object-record/graphql/utils/generateDepthOneRecordGqlFields';
import {
  getPersonObjectMetadataItem,
  getPersonRecord,
} from '~/testing/mock-data/people';

describe('generateDepthOneRecordGqlFields', () => {
  const objectMetadataItem = getPersonObjectMetadataItem();
  it('Should handle basic call with both objectMetadataItem and record', () => {
    const personRecord = getPersonRecord();
    const result = generateDepthOneRecordGqlFields({
      objectMetadataItem,
      record: personRecord,
    });
    expect(result).toMatchInlineSnapshot(`
{
  "attachments": false,
  "avatarUrl": false,
  "calendarEventParticipants": false,
  "city": true,
  "company": true,
  "companyId": false,
  "createdAt": true,
  "createdBy": true,
  "deletedAt": true,
  "emails": false,
  "favorites": false,
  "id": true,
  "intro": false,
  "jobTitle": true,
  "linkedinLink": true,
  "messageParticipants": false,
  "name": true,
  "noteTargets": true,
  "performanceRating": false,
  "phones": true,
  "pointOfContactForOpportunities": false,
  "position": true,
  "searchVector": false,
  "taskTargets": true,
  "timelineActivities": false,
  "updatedAt": false,
  "whatsapp": false,
  "workPreference": false,
  "xLink": true,
}
`);
  });

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
