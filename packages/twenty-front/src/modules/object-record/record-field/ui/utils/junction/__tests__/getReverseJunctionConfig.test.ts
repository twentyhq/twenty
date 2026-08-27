import { generateDepthRecordGqlFieldsFromFields } from '@/object-record/graphql/record-gql-fields/utils/generateDepthRecordGqlFieldsFromFields';
import { getReverseJunctionConfig } from '@/object-record/record-field/ui/utils/junction/getReverseJunctionConfig';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

describe('getReverseJunctionConfig', () => {
  const objectMetadataItems = getTestEnrichedObjectMetadataItemsMock();
  const companyMetadata = getMockObjectMetadataItemOrThrow('company');
  const noteTargetMetadata = getMockObjectMetadataItemOrThrow('noteTarget');
  const taskTargetMetadata = getMockObjectMetadataItemOrThrow('taskTarget');

  it.each([
    {
      junctionObjectMetadataId: noteTargetMetadata.id,
      relatedObjectNameSingular: 'note',
      relationFieldName: 'note',
    },
    {
      junctionObjectMetadataId: taskTargetMetadata.id,
      relatedObjectNameSingular: 'task',
      relationFieldName: 'task',
    },
  ])(
    'resolves $relatedObjectNameSingular through configured junction metadata',
    ({
      junctionObjectMetadataId,
      relatedObjectNameSingular,
      relationFieldName,
    }) => {
      const result = getReverseJunctionConfig({
        junctionObjectMetadataId,
        sourceObjectMetadataId: companyMetadata.id,
        objectMetadataItems,
      });

      expect(result).toMatchObject({
        junctionObjectMetadata: { id: junctionObjectMetadataId },
        relatedObjectMetadata: {
          nameSingular: relatedObjectNameSingular,
        },
        relationFieldName,
      });
    },
  );

  it('returns null when no configured junction targets the source object', () => {
    expect(
      getReverseJunctionConfig({
        junctionObjectMetadataId: noteTargetMetadata.id,
        sourceObjectMetadataId: 'unsupported-object-id',
        objectMetadataItems,
      }),
    ).toBeNull();
  });

  it('generates reverse relation fields without activity-specific names', () => {
    const noteTargetsField = getMockFieldMetadataItemOrThrow({
      objectMetadataItem: companyMetadata,
      fieldName: 'noteTargets',
    });

    const result = generateDepthRecordGqlFieldsFromFields({
      objectMetadataItems,
      sourceObjectMetadataItem: companyMetadata,
      fields: [noteTargetsField],
      depth: 1,
    });

    expect(result).toMatchObject({
      noteTargets: {
        id: true,
        note: {
          id: true,
          title: true,
        },
      },
    });
  });
});
