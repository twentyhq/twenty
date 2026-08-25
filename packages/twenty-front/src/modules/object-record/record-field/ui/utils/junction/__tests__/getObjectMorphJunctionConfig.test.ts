import { getObjectMorphJunctionConfig } from '@/object-record/record-field/ui/utils/junction/getObjectMorphJunctionConfig';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

describe('getObjectMorphJunctionConfig', () => {
  const objectMetadataItems = getTestEnrichedObjectMetadataItemsMock();

  it.each([
    {
      objectNameSingular: 'note',
      junctionFieldName: 'noteTargets',
      junctionObjectNameSingular: 'noteTarget',
      sourceFieldName: 'note',
      sourceJoinColumnName: 'noteId',
    },
    {
      objectNameSingular: 'task',
      junctionFieldName: 'taskTargets',
      junctionObjectNameSingular: 'taskTarget',
      sourceFieldName: 'task',
      sourceJoinColumnName: 'taskId',
    },
  ])(
    'resolves the morph junction of $objectNameSingular',
    ({
      objectNameSingular,
      junctionFieldName,
      junctionObjectNameSingular,
      sourceFieldName,
      sourceJoinColumnName,
    }) => {
      const result = getObjectMorphJunctionConfig({
        objectMetadata: getMockObjectMetadataItemOrThrow(objectNameSingular),
        objectMetadataItems,
      });

      expect(result).toMatchObject({
        junctionObjectMetadata: { nameSingular: junctionObjectNameSingular },
        junctionField: { name: junctionFieldName },
        sourceField: { name: sourceFieldName },
        sourceJoinColumnName,
        isMorphRelation: true,
      });
    },
  );

  it('returns null for an object that reaches no junction', () => {
    expect(
      getObjectMorphJunctionConfig({
        objectMetadata: getMockObjectMetadataItemOrThrow('noteTarget'),
        objectMetadataItems,
      }),
    ).toBeNull();
  });

  it('returns null for an object whose junctions all target a single object', () => {
    expect(
      getObjectMorphJunctionConfig({
        objectMetadata: getMockObjectMetadataItemOrThrow('person'),
        objectMetadataItems,
      }),
    ).toBeNull();
  });
});
