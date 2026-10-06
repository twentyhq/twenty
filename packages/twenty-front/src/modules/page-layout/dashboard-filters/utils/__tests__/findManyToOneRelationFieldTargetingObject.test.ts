import {
  OPPORTUNITY_ASSIGNEE,
  OPPORTUNITY_OBJECT,
  OPPORTUNITY_POINT_OF_CONTACT,
  PERSON_OBJECT_ID,
  WORKSPACE_MEMBER_OBJECT_ID,
} from '@/page-layout/dashboard-filters/testing/dashboardFilterTestFixtures';
import { findManyToOneRelationFieldTargetingObject } from '@/page-layout/dashboard-filters/utils/findManyToOneRelationFieldTargetingObject';

describe('findManyToOneRelationFieldTargetingObject', () => {
  it('picks the first relation by name among several pointing at the object', () => {
    expect(
      findManyToOneRelationFieldTargetingObject({
        fields: [...OPPORTUNITY_OBJECT.fields].reverse(),
        targetObjectMetadataId: WORKSPACE_MEMBER_OBJECT_ID,
      }),
    ).toBe(OPPORTUNITY_ASSIGNEE);
  });

  it('finds a single relation and ignores inactive ones', () => {
    expect(
      findManyToOneRelationFieldTargetingObject({
        fields: OPPORTUNITY_OBJECT.fields,
        targetObjectMetadataId: PERSON_OBJECT_ID,
      }),
    ).toBe(OPPORTUNITY_POINT_OF_CONTACT);
    expect(
      findManyToOneRelationFieldTargetingObject({
        fields: [{ ...OPPORTUNITY_POINT_OF_CONTACT, isActive: false }],
        targetObjectMetadataId: PERSON_OBJECT_ID,
      }),
    ).toBeUndefined();
  });
});
