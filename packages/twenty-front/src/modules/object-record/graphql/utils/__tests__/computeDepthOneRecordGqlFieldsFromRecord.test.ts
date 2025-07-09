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
  "avatarUrl": true,
  "calendarEventParticipants": false,
  "city": true,
  "company": true,
  "companyId": false,
  "createdAt": true,
  "createdBy": true,
  "deletedAt": true,
  "emails": true,
  "favorites": false,
  "id": true,
  "intro": true,
  "jobTitle": true,
  "linkedinLink": true,
  "messageParticipants": false,
  "name": true,
  "noteTargets": true,
  "performanceRating": true,
  "phones": true,
  "pointOfContactForOpportunities": false,
  "position": true,
  "searchVector": false,
  "taskTargets": true,
  "timelineActivities": false,
  "updatedAt": true,
  "whatsapp": true,
  "workPreference": true,
  "xLink": true,
}
`);
  });
});
