import { getSystemRelationFieldUniversalIdentifier } from 'twenty-shared/application';
import {
  DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS,
  STANDARD_OBJECTS,
} from 'twenty-shared/metadata';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import {
  buildMissingObjectSystemRelationCandidates,
  type DefaultRelationHolderNameSingular,
} from 'src/database/commands/upgrade-version-command/2-38/utils/build-missing-object-system-relation-candidates.util';

const STANDARD_APP_UID = '20202020-0000-4000-8000-000000000001';
const CUSTOM_APP_UID = '20202020-0000-4000-8000-000000000002';

const HOLDER_NAME_PLURALS: Record<DefaultRelationHolderNameSingular, string> = {
  timelineActivity: 'timelineActivities',
  attachment: 'attachments',
  noteTarget: 'noteTargets',
  taskTarget: 'taskTargets',
};

type SourceSpecification = {
  key: string;
  nameSingular: string;
  isActive?: boolean;
  applicationUniversalIdentifier?: string;
  pairedHolders?: DefaultRelationHolderNameSingular[];
  reverseOnlyHolders?: DefaultRelationHolderNameSingular[];
  forwardOnlyHolders?: DefaultRelationHolderNameSingular[];
  extraFieldNames?: string[];
};

type BuildArgs = {
  sources: SourceSpecification[];
  holderExtraFieldNames?: Partial<
    Record<DefaultRelationHolderNameSingular, string[]>
  >;
  columnNamesByHolder?: Partial<
    Record<DefaultRelationHolderNameSingular, string[]>
  >;
  extraFieldsByUniversalIdentifier?: Record<string, object>;
};

const buildArgs = ({
  sources,
  holderExtraFieldNames = {},
  columnNamesByHolder = {},
  extraFieldsByUniversalIdentifier = {},
}: BuildArgs) => {
  const objects: Record<string, object> = {};
  const fields: Record<string, object> = {};
  const holderFieldIds: Record<DefaultRelationHolderNameSingular, string[]> = {
    timelineActivity: [],
    attachment: [],
    noteTarget: [],
    taskTarget: [],
  };

  const registerField = (fieldId: string, field: object) => {
    fields[`uid-${fieldId}`] = {
      id: fieldId,
      universalIdentifier: `uid-${fieldId}`,
      ...field,
    };
  };

  for (const holderNameSingular of DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS) {
    for (const name of holderExtraFieldNames[holderNameSingular] ?? []) {
      const fieldId = `field-${holderNameSingular}-${name}`;

      holderFieldIds[holderNameSingular].push(fieldId);
      registerField(fieldId, { name, type: FieldMetadataType.TEXT });
    }
  }

  for (const source of sources) {
    const sourceFieldIds: string[] = [];

    for (const holderNameSingular of [
      ...(source.pairedHolders ?? []),
      ...(source.reverseOnlyHolders ?? []),
    ]) {
      const fieldId = `field-${holderNameSingular}-target-${source.key}`;

      holderFieldIds[holderNameSingular].push(fieldId);
      registerField(fieldId, {
        name: `target${source.nameSingular[0].toUpperCase()}${source.nameSingular.slice(1)}`,
        type: FieldMetadataType.MORPH_RELATION,
        morphId:
          STANDARD_OBJECTS[holderNameSingular].morphIds.targetMorphId.morphId,
        relationTargetObjectMetadataId: `object-${source.key}`,
        universalSettings: { relationType: RelationType.MANY_TO_ONE },
      });
    }

    for (const holderNameSingular of [
      ...(source.pairedHolders ?? []),
      ...(source.forwardOnlyHolders ?? []),
    ]) {
      const fieldId = `field-${source.key}-${holderNameSingular}`;

      sourceFieldIds.push(fieldId);
      registerField(fieldId, {
        name: HOLDER_NAME_PLURALS[holderNameSingular],
        type: FieldMetadataType.RELATION,
        relationTargetObjectMetadataId: `object-${holderNameSingular}`,
        universalSettings: { relationType: RelationType.ONE_TO_MANY },
      });
    }

    for (const name of source.extraFieldNames ?? []) {
      const fieldId = `field-${source.key}-${name}`;

      sourceFieldIds.push(fieldId);
      registerField(fieldId, { name, type: FieldMetadataType.TEXT });
    }

    objects[`object-uid-${source.key}`] = {
      id: `object-${source.key}`,
      universalIdentifier: `object-uid-${source.key}`,
      applicationUniversalIdentifier:
        source.applicationUniversalIdentifier ?? CUSTOM_APP_UID,
      nameSingular: source.nameSingular,
      namePlural: `${source.nameSingular}s`,
      isActive: source.isActive ?? true,
      fieldIds: sourceFieldIds,
    };
  }

  const holderFlatObjectMetadataByNameSingular = {} as Record<
    DefaultRelationHolderNameSingular,
    object
  >;

  for (const holderNameSingular of DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS) {
    const holderFlatObjectMetadata = {
      id: `object-${holderNameSingular}`,
      universalIdentifier:
        STANDARD_OBJECTS[holderNameSingular].universalIdentifier,
      applicationUniversalIdentifier: STANDARD_APP_UID,
      nameSingular: holderNameSingular,
      namePlural: HOLDER_NAME_PLURALS[holderNameSingular],
      isActive: true,
      fieldIds: holderFieldIds[holderNameSingular],
    };

    objects[STANDARD_OBJECTS[holderNameSingular].universalIdentifier] =
      holderFlatObjectMetadata;
    holderFlatObjectMetadataByNameSingular[holderNameSingular] =
      holderFlatObjectMetadata;
  }

  const allFields = { ...fields, ...extraFieldsByUniversalIdentifier };

  return {
    flatObjectMetadataMaps: {
      byUniversalIdentifier: objects,
      universalIdentifierById: Object.fromEntries(
        Object.values(objects).map((object) => [
          (object as { id: string }).id,
          (object as { universalIdentifier: string }).universalIdentifier,
        ]),
      ),
      universalIdentifiersByApplicationId: {},
    },
    flatFieldMetadataMaps: {
      byUniversalIdentifier: allFields,
      universalIdentifierById: Object.fromEntries(
        Object.values(allFields).map((field) => [
          (field as { id: string }).id,
          (field as { universalIdentifier: string }).universalIdentifier,
        ]),
      ),
      universalIdentifiersByApplicationId: {},
    },
    holderFlatObjectMetadataByNameSingular,
    existingColumnNamesByHolderNameSingular: Object.fromEntries(
      DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS.map((holderNameSingular) => [
        holderNameSingular,
        new Set(columnNamesByHolder[holderNameSingular] ?? []),
      ]),
    ),
    twentyStandardApplicationUniversalIdentifier: STANDARD_APP_UID,
  } as unknown as Parameters<
    typeof buildMissingObjectSystemRelationCandidates
  >[0];
};

describe('buildMissingObjectSystemRelationCandidates', () => {
  it('provisions all four pairs for an object that has none', () => {
    const result = buildMissingObjectSystemRelationCandidates(
      buildArgs({
        sources: [{ key: 'phone', nameSingular: 'phoneNumber2' }],
      }),
    );

    expect(result.unprovisionableSystemRelations).toEqual([]);
    expect(result.candidates).toHaveLength(1);
    expect(result.candidates[0].sourceFlatObjectMetadata.nameSingular).toBe(
      'phoneNumber2',
    );
    expect(result.candidates[0].missingHolderNameSingulars).toEqual([
      'timelineActivity',
      'attachment',
      'noteTarget',
      'taskTarget',
    ]);
  });

  it('skips objects owned by twenty-standard', () => {
    const result = buildMissingObjectSystemRelationCandidates(
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

    expect(result.candidates).toEqual([]);
    expect(result.unprovisionableSystemRelations).toEqual([]);
  });

  it('skips pairs where both legs already exist', () => {
    const result = buildMissingObjectSystemRelationCandidates(
      buildArgs({
        sources: [
          {
            key: 'deal',
            nameSingular: 'deal',
            pairedHolders: [...DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS],
          },
        ],
      }),
    );

    expect(result.candidates).toEqual([]);
    expect(result.unprovisionableSystemRelations).toEqual([]);
  });

  it('reports a partial pair instead of completing it', () => {
    const result = buildMissingObjectSystemRelationCandidates(
      buildArgs({
        sources: [
          {
            key: 'deal',
            nameSingular: 'deal',
            reverseOnlyHolders: ['timelineActivity'],
            forwardOnlyHolders: ['attachment'],
          },
        ],
      }),
    );

    expect(result.unprovisionableSystemRelations).toEqual([
      {
        sourceObjectNameSingular: 'deal',
        holderNameSingular: 'timelineActivity',
        reason: expect.stringContaining('reverse morph'),
      },
      {
        sourceObjectNameSingular: 'deal',
        holderNameSingular: 'attachment',
        reason: expect.stringContaining('forward relation'),
      },
    ]);
    expect(result.candidates[0].missingHolderNameSingulars).toEqual([
      'noteTarget',
      'taskTarget',
    ]);
  });

  it('reports an inactive object instead of provisioning it', () => {
    const result = buildMissingObjectSystemRelationCandidates(
      buildArgs({
        sources: [
          {
            key: 'archived',
            nameSingular: 'estateLeadArchived',
            isActive: false,
          },
        ],
      }),
    );

    expect(result.candidates).toEqual([]);
    expect(result.unprovisionableSystemRelations).toHaveLength(4);
    expect(result.unprovisionableSystemRelations[0].reason).toContain(
      'inactive',
    );
  });

  it('reports a reverse field name already taken on the holder', () => {
    const result = buildMissingObjectSystemRelationCandidates(
      buildArgs({
        sources: [{ key: 'phone', nameSingular: 'phoneNumber2' }],
        holderExtraFieldNames: { timelineActivity: ['targetPhoneNumber2'] },
      }),
    );

    expect(result.unprovisionableSystemRelations).toEqual([
      {
        sourceObjectNameSingular: 'phoneNumber2',
        holderNameSingular: 'timelineActivity',
        reason: expect.stringContaining('already exists on timelineActivity'),
      },
    ]);
    expect(result.candidates[0].missingHolderNameSingulars).toEqual([
      'attachment',
      'noteTarget',
      'taskTarget',
    ]);
  });

  it('reports a forward field name already taken on the source', () => {
    const result = buildMissingObjectSystemRelationCandidates(
      buildArgs({
        sources: [
          {
            key: 'phone',
            nameSingular: 'phoneNumber2',
            extraFieldNames: ['attachments'],
          },
        ],
      }),
    );

    expect(result.unprovisionableSystemRelations).toEqual([
      {
        sourceObjectNameSingular: 'phoneNumber2',
        holderNameSingular: 'attachment',
        reason: expect.stringContaining('already exists on phoneNumber2'),
      },
    ]);
    expect(result.candidates[0].missingHolderNameSingulars).toEqual([
      'timelineActivity',
      'noteTarget',
      'taskTarget',
    ]);
  });

  it('reports a surviving physical join column', () => {
    const result = buildMissingObjectSystemRelationCandidates(
      buildArgs({
        sources: [{ key: 'phone', nameSingular: 'phoneNumber2' }],
        columnNamesByHolder: {
          timelineActivity: ['targetPhoneNumber2Id'],
        },
      }),
    );

    expect(result.unprovisionableSystemRelations).toEqual([
      {
        sourceObjectNameSingular: 'phoneNumber2',
        holderNameSingular: 'timelineActivity',
        reason: expect.stringContaining(
          'column "targetPhoneNumber2Id" already exists',
        ),
      },
    ]);
    expect(result.candidates[0].missingHolderNameSingulars).toEqual([
      'attachment',
      'noteTarget',
      'taskTarget',
    ]);
  });

  it('counts a leg held by its deterministic identifier even without matching relation semantics', () => {
    const reverseFieldUniversalIdentifier =
      getSystemRelationFieldUniversalIdentifier({
        applicationUniversalIdentifier: CUSTOM_APP_UID,
        objectUniversalIdentifier:
          STANDARD_OBJECTS.timelineActivity.universalIdentifier,
        relationTargetObjectUniversalIdentifier: 'object-uid-phone',
      });

    const result = buildMissingObjectSystemRelationCandidates(
      buildArgs({
        sources: [{ key: 'phone', nameSingular: 'phoneNumber2' }],
        extraFieldsByUniversalIdentifier: {
          [reverseFieldUniversalIdentifier]: {
            id: 'field-detached',
            universalIdentifier: reverseFieldUniversalIdentifier,
            name: 'unrelated',
            type: FieldMetadataType.TEXT,
          },
        },
      }),
    );

    expect(result.unprovisionableSystemRelations).toEqual([
      {
        sourceObjectNameSingular: 'phoneNumber2',
        holderNameSingular: 'timelineActivity',
        reason: expect.stringContaining('partial pair'),
      },
    ]);
    expect(result.candidates[0].missingHolderNameSingulars).toEqual([
      'attachment',
      'noteTarget',
      'taskTarget',
    ]);
  });
});
