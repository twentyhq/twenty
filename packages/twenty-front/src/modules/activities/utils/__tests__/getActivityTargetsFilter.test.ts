import { getActivityTargetsFilter } from '@/activities/utils/getActivityTargetsFilter';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { CoreObjectNameSingular } from 'twenty-shared/types';

const objectMetadataItems = [
  {
    id: 'note-target-id',
    nameSingular: CoreObjectNameSingular.NoteTarget,
    fields: [
      {
        relation: {
          targetObjectMetadata: {
            id: 'custom-object-id',
          },
        },
        settings: {
          joinColumnName: 'targetLegacyCustomObjectId',
        },
      },
    ],
  },
  {
    id: 'task-target-id',
    nameSingular: CoreObjectNameSingular.TaskTarget,
    fields: [
      {
        relation: {
          targetObjectMetadata: {
            id: 'custom-object-id',
          },
        },
        settings: {
          joinColumnName: 'targetTaskLegacyCustomObjectId',
        },
      },
    ],
  },
  {
    id: 'custom-object-id',
    nameSingular: 'customObjectRenamed',
    fields: [],
  },
] as unknown as Pick<
  EnrichedObjectMetadataItem,
  'nameSingular' | 'fields' | 'id'
>[];

describe('getActivityTargetsFilter', () => {
  it('should use joinColumnName from note target metadata when object was renamed', () => {
    const filter = getActivityTargetsFilter({
      targetableObjects: [
        {
          id: 'record-id',
          targetObjectNameSingular: 'customObjectRenamed',
        },
      ],
      activityObjectNameSingular: CoreObjectNameSingular.Note,
      objectMetadataItems,
    });

    expect(filter).toEqual({
      targetLegacyCustomObjectId: {
        eq: 'record-id',
      },
    });
  });

  it('should use task target metadata when filtering task targets', () => {
    const filter = getActivityTargetsFilter({
      targetableObjects: [
        {
          id: 'record-id',
          targetObjectNameSingular: 'customObjectRenamed',
        },
      ],
      activityObjectNameSingular: CoreObjectNameSingular.Task,
      objectMetadataItems,
    });

    expect(filter).toEqual({
      targetTaskLegacyCustomObjectId: {
        eq: 'record-id',
      },
    });
  });
});
