import { getActivityTargetJunctionConfig } from '@/activities/utils/getActivityTargetJunctionConfig';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

describe('getActivityTargetJunctionConfig', () => {
  const objectMetadataItems = getTestEnrichedObjectMetadataItemsMock();

  it.each([
    {
      objectNameSingular: CoreObjectNameSingular.Note,
      junctionObjectNameSingular: CoreObjectNameSingular.NoteTarget,
      activityTargetFieldName: 'noteTargets',
      sourceFieldName: 'note',
    },
    {
      objectNameSingular: CoreObjectNameSingular.Task,
      junctionObjectNameSingular: CoreObjectNameSingular.TaskTarget,
      activityTargetFieldName: 'taskTargets',
      sourceFieldName: 'task',
    },
  ])(
    'resolves the $objectNameSingular morph junction from metadata',
    ({
      objectNameSingular,
      junctionObjectNameSingular,
      activityTargetFieldName,
      sourceFieldName,
    }) => {
      const activityObjectMetadata =
        getMockObjectMetadataItemOrThrow(objectNameSingular);

      expect(
        getActivityTargetJunctionConfig({
          activityObjectMetadata,
          objectMetadataItems,
        }),
      ).toMatchObject({
        activityTargetField: { name: activityTargetFieldName },
        junctionObjectMetadata: { nameSingular: junctionObjectNameSingular },
        sourceField: { name: sourceFieldName },
        isMorphRelation: true,
      });
    },
  );

  it('returns null when the object has no morph junction relation', () => {
    const companyMetadata = getMockObjectMetadataItemOrThrow('company');

    expect(
      getActivityTargetJunctionConfig({
        activityObjectMetadata: companyMetadata,
        objectMetadataItems,
      }),
    ).toBeNull();
  });
});
