import { getTimelineActivityRecordGqlFields } from '@/activities/timeline-activities/utils/getTimelineActivityRecordGqlFields';
import { FieldMetadataType } from 'twenty-shared/types';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

describe('getTimelineActivityRecordGqlFields', () => {
  const timelineActivityObjectMetadataItem =
    getMockObjectMetadataItemOrThrow('timelineActivity');

  const recordGqlFields = getTimelineActivityRecordGqlFields({
    objectMetadataItems: getTestEnrichedObjectMetadataItemsMock(),
    fields: timelineActivityObjectMetadataItem.fields,
  });

  it('should request the morph target ids without their records', () => {
    const morphRelationFieldNames = timelineActivityObjectMetadataItem.fields
      .filter((field) => field.type === FieldMetadataType.MORPH_RELATION)
      .map((field) => field.name);

    expect(morphRelationFieldNames).not.toHaveLength(0);

    const targetGqlFields = Object.entries(recordGqlFields).filter(
      ([gqlFieldName]) => gqlFieldName.startsWith('target'),
    );

    expect(targetGqlFields).not.toHaveLength(0);
    expect(recordGqlFields).toMatchObject({ targetPersonId: true });
    targetGqlFields.forEach(([gqlFieldName, gqlFieldValue]) => {
      expect(gqlFieldName.endsWith('Id')).toBe(true);
      expect(gqlFieldValue).toBe(true);
    });
  });

  it('should keep the scalars and the author relation the timeline renders', () => {
    expect(recordGqlFields).toMatchObject({
      name: true,
      properties: true,
      linkedRecordId: true,
      linkedObjectMetadataId: true,
      workspaceMemberId: true,
      workspaceMember: expect.any(Object),
    });
    expect(recordGqlFields.linkedRecordCachedName).toBeUndefined();
  });
});
