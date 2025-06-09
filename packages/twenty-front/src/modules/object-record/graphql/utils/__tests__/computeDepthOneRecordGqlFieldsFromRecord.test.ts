import { computeDepthOneRecordGqlFieldsFromRecord } from '@/object-record/graphql/utils/computeDepthOneRecordGqlFieldsFromRecord';
import {
  allMockPersonRecords,
  getMockPersonObjectMetadataItem,
} from '~/testing/mock-data/people';

describe('computeDepthOneRecordGqlFieldsFromRecord', () => {
  const objectMetadataItem = getMockPersonObjectMetadataItem();
  it('Should handle basic call', () => {
    const personRecord = allMockPersonRecords[0];
    const result = computeDepthOneRecordGqlFieldsFromRecord({
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
