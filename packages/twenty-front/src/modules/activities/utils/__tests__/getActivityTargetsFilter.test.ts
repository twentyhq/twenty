import { getActivityTargetsFilter } from '@/activities/utils/getActivityTargetsFilter';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { FieldMetadataType, RelationType } from '~/generated-metadata/graphql';

const buildNoteTargetMetadata = ({
  fieldName,
  joinColumnName,
  targetNameSingular,
}: {
  fieldName: string;
  joinColumnName: string;
  targetNameSingular: string;
}) =>
  ({
    nameSingular: 'noteTarget',
    fields: [
      {
        name: fieldName,
        type: FieldMetadataType.MORPH_RELATION,
        settings: { joinColumnName },
        morphRelations: [
          {
            type: RelationType.MANY_TO_ONE,
            targetObjectMetadata: {
              id: 'target-object-id',
              nameSingular: targetNameSingular,
              namePlural: `${targetNameSingular}s`,
            },
          },
        ],
      },
    ],
  }) as unknown as EnrichedObjectMetadataItem;

describe('getActivityTargetsFilter', () => {
  it('uses the stored join column even when the target object was renamed', () => {
    // Object renamed from "pet" to "ligacao": the noteTarget field name and its
    // join column stay frozen as targetPet/targetPetId while the object now
    // reports nameSingular "ligacao". Deriving target<Name>Id would produce
    // targetLigacaoId, which does not exist on noteTarget.
    const activityTargetObjectMetadataItem = buildNoteTargetMetadata({
      fieldName: 'targetPet',
      joinColumnName: 'targetPetId',
      targetNameSingular: 'ligacao',
    });

    const filter = getActivityTargetsFilter({
      targetableObjects: [
        { id: 'record-1', targetObjectNameSingular: 'ligacao' },
      ],
      activityTargetObjectMetadataItem,
    });

    expect(filter).toEqual({ targetPetId: { eq: 'record-1' } });
    expect(filter).not.toHaveProperty('targetLigacaoId');
  });

  it('resolves the join column for a non-renamed object', () => {
    const activityTargetObjectMetadataItem = buildNoteTargetMetadata({
      fieldName: 'targetCompany',
      joinColumnName: 'targetCompanyId',
      targetNameSingular: 'company',
    });

    const filter = getActivityTargetsFilter({
      targetableObjects: [
        { id: 'record-2', targetObjectNameSingular: 'company' },
      ],
      activityTargetObjectMetadataItem,
    });

    expect(filter).toEqual({ targetCompanyId: { eq: 'record-2' } });
  });
});
