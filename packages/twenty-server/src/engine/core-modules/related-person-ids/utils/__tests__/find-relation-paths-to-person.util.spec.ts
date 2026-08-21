import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { findRelationPathsToPerson } from 'src/engine/core-modules/related-person-ids/utils/find-relation-paths-to-person.util';

type RelationSpec = {
  fieldName: string;
  relationType: RelationType;
  targetObjectNameSingular: string;
  inverseFieldName: string;
  morphId?: string;
};

const fieldId = (objectNameSingular: string, fieldName: string) =>
  `${objectNameSingular}.${fieldName}`;

const invertRelationType = (relationType: RelationType) =>
  relationType === RelationType.MANY_TO_ONE
    ? RelationType.ONE_TO_MANY
    : RelationType.MANY_TO_ONE;

const buildGraphFixtures = (
  graph: Record<string, RelationSpec[]>,
  options: { systemObjectNames?: string[] } = {},
) => {
  const systemObjectNames = options.systemObjectNames ?? [];
  const specsByObjectNameSingular = Object.fromEntries(
    Object.entries(graph).map(([objectNameSingular, relationSpecs]) => [
      objectNameSingular,
      [...relationSpecs],
    ]),
  );

  for (const [objectNameSingular, relationSpecs] of Object.entries(graph)) {
    for (const spec of relationSpecs) {
      const inverseSpecs =
        specsByObjectNameSingular[spec.targetObjectNameSingular];

      if (
        !isDefined(inverseSpecs) ||
        inverseSpecs.some(
          (inverseSpec) => inverseSpec.fieldName === spec.inverseFieldName,
        )
      ) {
        continue;
      }

      inverseSpecs.push({
        fieldName: spec.inverseFieldName,
        relationType: invertRelationType(spec.relationType),
        targetObjectNameSingular: objectNameSingular,
        inverseFieldName: spec.fieldName,
      });
    }
  }

  const flatObjectMetadataMaps = {
    byUniversalIdentifier: {},
    universalIdentifierById: {},
  } as unknown as FlatEntityMaps<FlatObjectMetadata>;

  const flatFieldMetadataMaps = {
    byUniversalIdentifier: {},
    universalIdentifierById: {},
  } as unknown as FlatEntityMaps<FlatFieldMetadata>;

  for (const [objectNameSingular, relationSpecs] of Object.entries(
    specsByObjectNameSingular,
  )) {
    flatObjectMetadataMaps.byUniversalIdentifier[objectNameSingular] = {
      id: objectNameSingular,
      universalIdentifier: objectNameSingular,
      nameSingular: objectNameSingular,
      namePlural: `${objectNameSingular}s`,
      isSystem: systemObjectNames.includes(objectNameSingular),
      fieldIds: relationSpecs.map((spec) =>
        fieldId(objectNameSingular, spec.fieldName),
      ),
    } as unknown as FlatObjectMetadata;
    flatObjectMetadataMaps.universalIdentifierById[objectNameSingular] =
      objectNameSingular;

    for (const spec of relationSpecs) {
      const id = fieldId(objectNameSingular, spec.fieldName);

      flatFieldMetadataMaps.byUniversalIdentifier[id] = {
        id,
        universalIdentifier: id,
        name: spec.fieldName,
        objectMetadataId: objectNameSingular,
        type: isDefined(spec.morphId)
          ? FieldMetadataType.MORPH_RELATION
          : FieldMetadataType.RELATION,
        morphId: spec.morphId ?? null,
        isActive: true,
        isSystem: false,
        relationTargetFieldMetadataId: fieldId(
          spec.targetObjectNameSingular,
          spec.inverseFieldName,
        ),
        settings: { relationType: spec.relationType },
        universalSettings: { relationType: spec.relationType },
      } as unknown as FlatFieldMetadata;
      flatFieldMetadataMaps.universalIdentifierById[id] = id;
    }
  }

  return { flatObjectMetadataMaps, flatFieldMetadataMaps };
};

describe('findRelationPathsToPerson', () => {
  it('returns the empty path for the person object itself', () => {
    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      buildGraphFixtures({ person: [] });

    expect(
      findRelationPathsToPerson({
        rootObjectNameSingular: 'person',
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      }),
    ).toEqual([[]]);
  });

  it('resolves a direct relation to person, querying person by its foreign key', () => {
    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      buildGraphFixtures({
        company: [
          {
            fieldName: 'people',
            relationType: RelationType.ONE_TO_MANY,
            targetObjectNameSingular: 'person',
            inverseFieldName: 'company',
          },
        ],
        person: [
          {
            fieldName: 'company',
            relationType: RelationType.MANY_TO_ONE,
            targetObjectNameSingular: 'company',
            inverseFieldName: 'people',
          },
        ],
      });

    expect(
      findRelationPathsToPerson({
        rootObjectNameSingular: 'company',
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      }),
    ).toEqual([
      [
        {
          direction: RelationType.ONE_TO_MANY,
          queryObjectNameSingular: 'person',
          joinColumnName: 'companyId',
        },
      ],
    ]);
  });

  it('resolves person through a two-hop join object', () => {
    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      buildGraphFixtures({
        peopleList: [
          {
            fieldName: 'peopleListMemberships',
            relationType: RelationType.ONE_TO_MANY,
            targetObjectNameSingular: 'peopleListMembership',
            inverseFieldName: 'peopleList',
          },
        ],
        peopleListMembership: [
          {
            fieldName: 'peopleList',
            relationType: RelationType.MANY_TO_ONE,
            targetObjectNameSingular: 'peopleList',
            inverseFieldName: 'peopleListMemberships',
          },
          {
            fieldName: 'person',
            relationType: RelationType.MANY_TO_ONE,
            targetObjectNameSingular: 'person',
            inverseFieldName: 'peopleListMemberships',
          },
        ],
        person: [
          {
            fieldName: 'peopleListMemberships',
            relationType: RelationType.ONE_TO_MANY,
            targetObjectNameSingular: 'peopleListMembership',
            inverseFieldName: 'person',
          },
        ],
      });

    expect(
      findRelationPathsToPerson({
        rootObjectNameSingular: 'peopleList',
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      }),
    ).toEqual([
      [
        {
          direction: RelationType.ONE_TO_MANY,
          queryObjectNameSingular: 'peopleListMembership',
          joinColumnName: 'peopleListId',
        },
        {
          direction: RelationType.MANY_TO_ONE,
          queryObjectNameSingular: 'peopleListMembership',
          joinColumnName: 'personId',
        },
      ],
    ]);
  });

  it('collects both a direct and a longer relation chain to person (opportunity)', () => {
    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      buildGraphFixtures({
        opportunity: [
          {
            fieldName: 'pointOfContact',
            relationType: RelationType.MANY_TO_ONE,
            targetObjectNameSingular: 'person',
            inverseFieldName: 'pointOfContactForOpportunities',
          },
          {
            fieldName: 'company',
            relationType: RelationType.MANY_TO_ONE,
            targetObjectNameSingular: 'company',
            inverseFieldName: 'opportunities',
          },
        ],
        company: [
          {
            fieldName: 'people',
            relationType: RelationType.ONE_TO_MANY,
            targetObjectNameSingular: 'person',
            inverseFieldName: 'company',
          },
        ],
        person: [],
      });

    expect(
      findRelationPathsToPerson({
        rootObjectNameSingular: 'opportunity',
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      }),
    ).toEqual([
      [
        {
          direction: RelationType.MANY_TO_ONE,
          queryObjectNameSingular: 'opportunity',
          joinColumnName: 'pointOfContactId',
        },
      ],
      [
        {
          direction: RelationType.MANY_TO_ONE,
          queryObjectNameSingular: 'opportunity',
          joinColumnName: 'companyId',
        },
        {
          direction: RelationType.ONE_TO_MANY,
          queryObjectNameSingular: 'person',
          joinColumnName: 'companyId',
        },
      ],
    ]);
  });

  it('targets the morph field owning the join column rather than the morph group name', () => {
    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      buildGraphFixtures({
        note: [],
        task: [],
        person: [
          {
            fieldName: 'lastActivityItemNote',
            relationType: RelationType.MANY_TO_ONE,
            targetObjectNameSingular: 'note',
            inverseFieldName: 'peopleWithLastActivityItem',
            morphId: 'lastActivityItem',
          },
          {
            fieldName: 'lastActivityItemTask',
            relationType: RelationType.MANY_TO_ONE,
            targetObjectNameSingular: 'task',
            inverseFieldName: 'peopleWithLastActivityItem',
            morphId: 'lastActivityItem',
          },
        ],
      });

    expect(
      findRelationPathsToPerson({
        rootObjectNameSingular: 'note',
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      }),
    ).toEqual([
      [
        {
          direction: RelationType.ONE_TO_MANY,
          queryObjectNameSingular: 'person',
          joinColumnName: 'lastActivityItemNoteId',
        },
      ],
    ]);

    expect(
      findRelationPathsToPerson({
        rootObjectNameSingular: 'task',
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      }),
    ).toEqual([
      [
        {
          direction: RelationType.ONE_TO_MANY,
          queryObjectNameSingular: 'person',
          joinColumnName: 'lastActivityItemTaskId',
        },
      ],
    ]);
  });

  it('does not traverse system objects while looking for related people', () => {
    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      buildGraphFixtures(
        {
          opportunity: [
            {
              fieldName: 'pointOfContact',
              relationType: RelationType.MANY_TO_ONE,
              targetObjectNameSingular: 'person',
              inverseFieldName: 'pointOfContactForOpportunities',
            },
            {
              fieldName: 'owner',
              relationType: RelationType.MANY_TO_ONE,
              targetObjectNameSingular: 'workspaceMember',
              inverseFieldName: 'ownedOpportunities',
            },
          ],
          workspaceMember: [
            {
              fieldName: 'messageParticipants',
              relationType: RelationType.ONE_TO_MANY,
              targetObjectNameSingular: 'messageParticipant',
              inverseFieldName: 'workspaceMember',
            },
          ],
          messageParticipant: [
            {
              fieldName: 'person',
              relationType: RelationType.MANY_TO_ONE,
              targetObjectNameSingular: 'person',
              inverseFieldName: 'messageParticipants',
            },
          ],
          person: [],
        },
        { systemObjectNames: ['workspaceMember', 'messageParticipant'] },
      );

    expect(
      findRelationPathsToPerson({
        rootObjectNameSingular: 'opportunity',
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      }),
    ).toEqual([
      [
        {
          direction: RelationType.MANY_TO_ONE,
          queryObjectNameSingular: 'opportunity',
          joinColumnName: 'pointOfContactId',
        },
      ],
    ]);
  });

  it('returns no path when person is unreachable, terminating on relation cycles', () => {
    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      buildGraphFixtures({
        rocket: [
          {
            fieldName: 'cells',
            relationType: RelationType.ONE_TO_MANY,
            targetObjectNameSingular: 'rocketCell',
            inverseFieldName: 'rocket',
          },
        ],
        rocketCell: [
          {
            fieldName: 'rocket',
            relationType: RelationType.MANY_TO_ONE,
            targetObjectNameSingular: 'rocket',
            inverseFieldName: 'cells',
          },
        ],
        person: [],
      });

    expect(
      findRelationPathsToPerson({
        rootObjectNameSingular: 'rocket',
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      }),
    ).toEqual([]);
  });
});
