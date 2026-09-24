import { getSystemRelationFieldUniversalIdentifier } from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { findObjectsMissingAgentChatThreadTargetRelation } from 'src/database/commands/upgrade-version-command/2-43/utils/find-objects-missing-agent-chat-thread-target-relation.util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

const STANDARD_APP_UID = '20202020-0000-4000-8000-000000000001';
const CUSTOM_APP_UID = '20202020-0000-4000-8000-000000000002';
const TARGET_OBJECT_ID = 'object-agentChatThreadTarget';
const TARGET_NAME_PLURAL = 'agentChatThreadTargets';

type FieldSpecification = {
  id: string;
  objectMetadataId: string;
  name: string;
  type?: FieldMetadataType;
  morphId?: string;
  relationTargetObjectMetadataId?: string;
  universalIdentifier?: string;
};

type SourceSpecification = {
  key: string;
  nameSingular: string;
  isActive?: boolean;
  applicationUniversalIdentifier?: string;
  hasReverseField?: boolean;
  forwardField?: { name?: string; universalIdentifier?: string };
  extraFields?: {
    name: string;
    type?: FieldMetadataType;
    relationTargetObjectMetadataId?: string;
  }[];
};

type BuildArgs = {
  sources: SourceSpecification[];
  targetExtraFieldNames?: string[];
  targetColumnNames?: string[];
};

const buildArgs = ({
  sources,
  targetExtraFieldNames = [],
  targetColumnNames = [],
}: BuildArgs) => {
  const flatObjectMetadatas: FlatObjectMetadata[] = [];
  const flatFieldMetadatas: FlatFieldMetadata[] = [];
  const targetFieldIds: string[] = [];

  const registerField = ({
    id,
    universalIdentifier,
    type = FieldMetadataType.TEXT,
    ...rest
  }: FieldSpecification) => {
    flatFieldMetadatas.push(
      getFlatFieldMetadataMock({
        id,
        universalIdentifier: universalIdentifier ?? `uid-${id}`,
        type,
        ...rest,
      }),
    );

    return id;
  };

  for (const name of targetExtraFieldNames) {
    targetFieldIds.push(
      registerField({
        id: `field-target-${name}`,
        objectMetadataId: TARGET_OBJECT_ID,
        name,
      }),
    );
  }

  for (const source of sources) {
    const sourceFieldIds: string[] = [];

    if (source.hasReverseField) {
      targetFieldIds.push(
        registerField({
          id: `field-target-${source.key}`,
          objectMetadataId: TARGET_OBJECT_ID,
          name: `target${source.nameSingular[0].toUpperCase()}${source.nameSingular.slice(1)}`,
          type: FieldMetadataType.MORPH_RELATION,
          morphId:
            STANDARD_OBJECTS.agentChatThreadTarget.morphIds.targetMorphId
              .morphId,
          relationTargetObjectMetadataId: `object-${source.key}`,
        }),
      );
    }

    if (isDefined(source.forwardField)) {
      sourceFieldIds.push(
        registerField({
          id: `field-${source.key}-forward`,
          objectMetadataId: `object-${source.key}`,
          name: source.forwardField.name ?? TARGET_NAME_PLURAL,
          type: FieldMetadataType.RELATION,
          relationTargetObjectMetadataId: TARGET_OBJECT_ID,
          ...(isDefined(source.forwardField.universalIdentifier) && {
            universalIdentifier: source.forwardField.universalIdentifier,
          }),
        }),
      );
    }

    for (const extraField of source.extraFields ?? []) {
      sourceFieldIds.push(
        registerField({
          id: `field-${source.key}-${extraField.name}`,
          objectMetadataId: `object-${source.key}`,
          ...extraField,
        }),
      );
    }

    flatObjectMetadatas.push(
      getFlatObjectMetadataMock({
        id: `object-${source.key}`,
        universalIdentifier: `object-uid-${source.key}`,
        applicationUniversalIdentifier:
          source.applicationUniversalIdentifier ?? CUSTOM_APP_UID,
        nameSingular: source.nameSingular,
        namePlural: `${source.nameSingular}s`,
        isActive: source.isActive ?? true,
        fieldIds: sourceFieldIds,
      }),
    );
  }

  const targetFlatObjectMetadata = getFlatObjectMetadataMock({
    id: TARGET_OBJECT_ID,
    universalIdentifier:
      STANDARD_OBJECTS.agentChatThreadTarget.universalIdentifier,
    applicationUniversalIdentifier: STANDARD_APP_UID,
    nameSingular: 'agentChatThreadTarget',
    namePlural: TARGET_NAME_PLURAL,
    fieldIds: targetFieldIds,
  });

  flatObjectMetadatas.push(targetFlatObjectMetadata);

  return {
    flatObjectMetadataMaps: flatObjectMetadatas.reduce<
      FlatEntityMaps<FlatObjectMetadata>
    >(
      (flatEntityMaps, flatEntity) =>
        addFlatEntityToFlatEntityMapsOrThrow({ flatEntity, flatEntityMaps }),
      createEmptyFlatEntityMaps(),
    ),
    flatFieldMetadataMaps: flatFieldMetadatas.reduce<
      FlatEntityMaps<FlatFieldMetadata>
    >(
      (flatEntityMaps, flatEntity) =>
        addFlatEntityToFlatEntityMapsOrThrow({ flatEntity, flatEntityMaps }),
      createEmptyFlatEntityMaps(),
    ),
    targetFlatObjectMetadata,
    existingTargetColumnNames: new Set(targetColumnNames),
    twentyStandardApplicationUniversalIdentifier: STANDARD_APP_UID,
  };
};

const getMissingObjectNames = (
  result: ReturnType<typeof findObjectsMissingAgentChatThreadTargetRelation>,
) => result.flatObjectMetadatas.map(({ nameSingular }) => nameSingular);

describe('findObjectsMissingAgentChatThreadTargetRelation', () => {
  it('finds a custom object that has neither field of the pair', () => {
    const result = findObjectsMissingAgentChatThreadTargetRelation(
      buildArgs({ sources: [{ key: 'pet', nameSingular: 'pet' }] }),
    );

    expect(getMissingObjectNames(result)).toEqual(['pet']);
    expect(result.unprovisionableRelations).toEqual([]);
  });

  // Their pairs are authored by the standard application itself.
  it('leaves objects owned by twenty-standard alone', () => {
    const result = findObjectsMissingAgentChatThreadTargetRelation(
      buildArgs({
        sources: [
          {
            key: 'company',
            nameSingular: 'company',
            applicationUniversalIdentifier: STANDARD_APP_UID,
          },
        ],
      }),
    );

    expect(getMissingObjectNames(result)).toEqual([]);
    expect(result.unprovisionableRelations).toEqual([]);
  });

  it('skips an object whose pair already exists', () => {
    const result = findObjectsMissingAgentChatThreadTargetRelation(
      buildArgs({
        sources: [
          {
            key: 'pet',
            nameSingular: 'pet',
            hasReverseField: true,
            forwardField: {},
          },
        ],
      }),
    );

    expect(getMissingObjectNames(result)).toEqual([]);
    expect(result.unprovisionableRelations).toEqual([]);
  });

  it('recognizes a forward field by its identifier whatever its name', () => {
    const result = findObjectsMissingAgentChatThreadTargetRelation(
      buildArgs({
        sources: [
          {
            key: 'pet',
            nameSingular: 'pet',
            hasReverseField: true,
            forwardField: {
              name: 'chats',
              universalIdentifier: getSystemRelationFieldUniversalIdentifier({
                applicationUniversalIdentifier: CUSTOM_APP_UID,
                objectUniversalIdentifier: 'object-uid-pet',
                relationTargetObjectUniversalIdentifier:
                  STANDARD_OBJECTS.agentChatThreadTarget.universalIdentifier,
              }),
            },
          },
        ],
      }),
    );

    expect(getMissingObjectNames(result)).toEqual([]);
    expect(result.unprovisionableRelations).toEqual([]);
  });

  it('reports a partial pair instead of completing it', () => {
    const result = findObjectsMissingAgentChatThreadTargetRelation(
      buildArgs({
        sources: [
          { key: 'pet', nameSingular: 'pet', hasReverseField: true },
          { key: 'toy', nameSingular: 'toy', forwardField: {} },
        ],
      }),
    );

    expect(getMissingObjectNames(result)).toEqual([]);
    expect(result.unprovisionableRelations).toEqual([
      {
        objectNameSingular: 'pet',
        reason: expect.stringContaining('only the reverse morph leg'),
      },
      {
        objectNameSingular: 'toy',
        reason: expect.stringContaining('only the forward relation leg'),
      },
    ]);
  });

  it('finds an inactive object like its creation would have', () => {
    const result = findObjectsMissingAgentChatThreadTargetRelation(
      buildArgs({
        sources: [{ key: 'pet', nameSingular: 'pet', isActive: false }],
      }),
    );

    expect(getMissingObjectNames(result)).toEqual(['pet']);
  });

  it('does not let another relation to the target mask a missing pair', () => {
    const result = findObjectsMissingAgentChatThreadTargetRelation(
      buildArgs({
        sources: [
          {
            key: 'pet',
            nameSingular: 'pet',
            extraFields: [
              {
                name: 'favoriteChatLink',
                type: FieldMetadataType.RELATION,
                relationTargetObjectMetadataId: TARGET_OBJECT_ID,
              },
            ],
          },
        ],
      }),
    );

    expect(getMissingObjectNames(result)).toEqual(['pet']);
    expect(result.unprovisionableRelations).toEqual([]);
  });

  it('reports a reverse field name already taken on the target', () => {
    const result = findObjectsMissingAgentChatThreadTargetRelation(
      buildArgs({
        sources: [{ key: 'pet', nameSingular: 'pet' }],
        targetExtraFieldNames: ['targetPet'],
      }),
    );

    expect(getMissingObjectNames(result)).toEqual([]);
    expect(result.unprovisionableRelations).toEqual([
      {
        objectNameSingular: 'pet',
        reason: 'field "targetPet" already exists on agentChatThreadTarget',
      },
    ]);
  });

  // The name alone does not make it the forward field: this one relates to
  // another object, so the pair is not partial, its name is just taken.
  it('reports a forward field name already taken on the object', () => {
    const result = findObjectsMissingAgentChatThreadTargetRelation(
      buildArgs({
        sources: [
          {
            key: 'pet',
            nameSingular: 'pet',
            extraFields: [
              {
                name: TARGET_NAME_PLURAL,
                type: FieldMetadataType.RELATION,
                relationTargetObjectMetadataId: 'object-owner',
              },
            ],
          },
        ],
      }),
    );

    expect(getMissingObjectNames(result)).toEqual([]);
    expect(result.unprovisionableRelations).toEqual([
      {
        objectNameSingular: 'pet',
        reason: 'field "agentChatThreadTargets" already exists on pet',
      },
    ]);
  });

  // A column the metadata no longer knows about still holds data, so adding a
  // field over it would fail or adopt values nobody wrote through this pair.
  it('reports a join column that already exists on the table', () => {
    const result = findObjectsMissingAgentChatThreadTargetRelation(
      buildArgs({
        sources: [{ key: 'pet', nameSingular: 'pet' }],
        targetColumnNames: ['targetPetId'],
      }),
    );

    expect(getMissingObjectNames(result)).toEqual([]);
    expect(result.unprovisionableRelations).toEqual([
      {
        objectNameSingular: 'pet',
        reason:
          'column "targetPetId" already exists on the agentChatThreadTarget table',
      },
    ]);
  });
});
