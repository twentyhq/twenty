import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getRecordInheritanceRulePaths } from '@/settings/roles/role-permissions/object-level-permissions/related-records/utils/getRecordInheritanceRulePaths';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const objectMetadataItems = getTestEnrichedObjectMetadataItemsMock();
const company = getMockObjectMetadataItemOrThrow('company');
const person = getMockObjectMetadataItemOrThrow('person');
const note = getMockObjectMetadataItemOrThrow('note');
const noteTarget = getMockObjectMetadataItemOrThrow('noteTarget');

const getPaths = (childObjectMetadataItem: EnrichedObjectMetadataItem) =>
  getRecordInheritanceRulePaths({
    childObjectMetadataItem,
    parentObjectMetadataId: company.id,
    objectMetadataItems,
  }).map(({ fieldMetadataId, junctionFieldMetadataId, relationKind }) => ({
    fieldMetadataId,
    junctionFieldMetadataId,
    relationKind,
  }));

describe('getRecordInheritanceRulePaths', () => {
  it('returns a one hop path for a many-to-one relation to the parent', () => {
    expect(getPaths(person)).toContainEqual({
      fieldMetadataId: getMockFieldMetadataItemOrThrow({
        objectMetadataItem: person,
        fieldName: 'company',
      }).id,
      junctionFieldMetadataId: null,
      relationKind: 'BELONGS_TO_ONE',
    });
  });

  it('returns a two hop path through a system junction to the parent morph target', () => {
    const noteTargetCompanyFieldId = getMockFieldMetadataItemOrThrow({
      objectMetadataItem: noteTarget,
      fieldName: 'target',
    }).morphRelations?.find(
      (morphRelation) => morphRelation.targetObjectMetadata.id === company.id,
    )?.sourceFieldMetadata.id;

    expect(getPaths(note)).toEqual([
      {
        fieldMetadataId: getMockFieldMetadataItemOrThrow({
          objectMetadataItem: note,
          fieldName: 'noteTargets',
        }).id,
        junctionFieldMetadataId: noteTargetCompanyFieldId,
        relationKind: 'MANY_TO_MANY',
      },
    ]);
  });

  it('returns no path for an object without a relation to the parent', () => {
    expect(
      getRecordInheritanceRulePaths({
        childObjectMetadataItem: getMockObjectMetadataItemOrThrow('rocket'),
        parentObjectMetadataId: company.id,
        objectMetadataItems,
      }),
    ).toEqual([]);
  });
});
