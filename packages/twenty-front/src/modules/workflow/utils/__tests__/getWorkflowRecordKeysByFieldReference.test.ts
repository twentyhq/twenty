import { getWorkflowRecordKeysByFieldReference } from '@/workflow/utils/getWorkflowRecordKeysByFieldReference';
import { FieldMetadataType, RelationType } from '~/generated-metadata/graphql';

describe('getWorkflowRecordKeysByFieldReference', () => {
  it('knows every name the server accepts for a field', () => {
    const recordKeysByFieldReference = getWorkflowRecordKeysByFieldReference({
      fields: [
        { name: 'jobTitle', type: FieldMetadataType.TEXT },
        {
          name: 'company',
          type: FieldMetadataType.RELATION,
          settings: { relationType: RelationType.MANY_TO_ONE },
        },
        {
          name: 'target',
          type: FieldMetadataType.MORPH_RELATION,
          settings: { relationType: RelationType.MANY_TO_ONE },
          morphRelations: [
            {
              targetObjectMetadata: {
                id: 'person-object-id',
                nameSingular: 'person',
                namePlural: 'people',
              },
            },
          ],
        },
      ],
    });

    expect(
      [
        'jobTitle',
        'company',
        'companyId',
        'target',
        'targetPerson',
        'targetPersonId',
        'targetId',
      ].filter((name) => recordKeysByFieldReference.has(name)),
    ).toEqual([
      'jobTitle',
      'company',
      'companyId',
      'target',
      'targetPerson',
      'targetPersonId',
    ]);
  });
});
