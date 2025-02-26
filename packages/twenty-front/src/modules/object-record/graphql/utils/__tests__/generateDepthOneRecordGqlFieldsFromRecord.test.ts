import { generateDepthOneRecordGqlFieldsFromRecord } from '@/object-record/graphql/utils/generateDepthOneRecordGqlFieldsFromRecord';
import {
  getPersonObjectMetadataItem,
  getPersonRecord,
} from '~/testing/mock-data/people';

describe('generateDepthOneRecordGqlFields', () => {
  const objectMetadataItem = getPersonObjectMetadataItem();
  it('Should handle basic call with both objectMetadataItem and record', () => {
    const personRecord = getPersonRecord();
    const result = generateDepthOneRecordGqlFieldsFromRecord({
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
});
