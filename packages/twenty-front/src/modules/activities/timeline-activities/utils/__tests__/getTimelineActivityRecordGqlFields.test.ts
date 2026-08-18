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

  it('should not request any morph target relation', () => {
    const morphRelationFieldNames = timelineActivityObjectMetadataItem.fields
      .filter((field) => field.type === FieldMetadataType.MORPH_RELATION)
      .map((field) => field.name);

    expect(morphRelationFieldNames).not.toHaveLength(0);

    expect(
      Object.keys(recordGqlFields).filter((gqlFieldName) =>
        gqlFieldName.startsWith('target'),
      ),
    ).toEqual([]);
  });

  it('should keep the scalars and the author relation the timeline renders', () => {
    expect(recordGqlFields).toMatchObject({
      name: true,
      properties: true,
      linkedRecordId: true,
      linkedObjectMetadataId: true,
      linkedRecordCachedName: true,
      workspaceMemberId: true,
      workspaceMember: expect.any(Object),
    });
  });
});
