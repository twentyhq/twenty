import { getActivityTargetsFilter } from '@/activities/utils/getActivityTargetsFilter';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { FieldMetadataType, RelationType } from '~/generated-metadata/graphql';

// The metadata API collapses the per-target join fields on noteTarget/taskTarget
// into a single MORPH_RELATION field named "target" and strips the target-name
// suffix from each morph relation's source field name. For a non-renamed target
// the source field name is the base "target"; for a renamed target the suffix no
// longer matches so it keeps the original (frozen) field name (e.g. "targetPet").
const buildActivityTargetMetadata = (
  morphTargets: { nameSingular: string; sourceFieldName: string }[],
) =>
  ({
    nameSingular: 'noteTarget',
    fields: [
      {
        name: 'target',
        type: FieldMetadataType.MORPH_RELATION,
        morphRelations: morphTargets.map(
          ({ nameSingular, sourceFieldName }) => ({
            type: RelationType.MANY_TO_ONE,
            targetObjectMetadata: {
              id: `${nameSingular}-object-id`,
              nameSingular,
              namePlural: `${nameSingular}s`,
            },
            sourceFieldMetadata: {
              id: `${nameSingular}-field-id`,
              name: sourceFieldName,
            },
          }),
        ),
      },
    ],
  }) as unknown as EnrichedObjectMetadataItem;

describe('getActivityTargetsFilter', () => {
  it('uses the frozen join column when the target object was renamed', () => {
    // "pet" was renamed to "ligacao": the morph relation keeps the frozen source
    // field name "targetPet", so the join column is targetPetId. Recomputing from
    // the current name would produce targetLigacaoId, which does not exist.
    const activityTargetObjectMetadataItem = buildActivityTargetMetadata([
      { nameSingular: 'company', sourceFieldName: 'target' },
      { nameSingular: 'ligacao', sourceFieldName: 'targetPet' },
    ]);

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
    const activityTargetObjectMetadataItem = buildActivityTargetMetadata([
      { nameSingular: 'company', sourceFieldName: 'target' },
      { nameSingular: 'ligacao', sourceFieldName: 'targetPet' },
    ]);

    const filter = getActivityTargetsFilter({
      targetableObjects: [
        { id: 'record-2', targetObjectNameSingular: 'company' },
      ],
      activityTargetObjectMetadataItem,
    });

    expect(filter).toEqual({ targetCompanyId: { eq: 'record-2' } });
  });
});
