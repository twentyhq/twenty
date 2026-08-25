import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { buildTimelineActivityTargetFieldRepairs } from 'src/database/commands/upgrade-version-command/2-35/utils/build-timeline-activity-target-field-repairs.util';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';

const TIMELINE_ACTIVITY_OBJECT_ID = 'timeline-activity-object-id';
const TARGET_MORPH_ID =
  STANDARD_OBJECTS.timelineActivity.morphIds.targetMorphId.morphId;

type FieldSpecification = {
  name: string;
  targetObjectKey: string;
  label?: string;
  isSystemSideEffect?: boolean;
  morphId?: string;
  relationType?: RelationType;
};

type BuildArgs = {
  targetObjectNameSingularByKey: Record<string, string>;
  fields: FieldSpecification[];
  indexedFieldNamesByIndexKey?: Record<string, string[]>;
  orphanedIndexIds?: string[];
  columnNames?: string[];
};

const buildArgs = ({
  targetObjectNameSingularByKey,
  fields,
  indexedFieldNamesByIndexKey = {},
  orphanedIndexIds = [],
  columnNames,
}: BuildArgs) => {
  const indexKeys = Object.keys(indexedFieldNamesByIndexKey);
  const entries = <TValue>(record: Record<string, TValue>) =>
    Object.entries(record);

  return {
    existingColumnNames: new Set(
      columnNames ?? fields.map(({ name }) => `${name}Id`),
    ),
    flatObjectMetadataMaps: {
      byUniversalIdentifier: {
        [STANDARD_OBJECTS.timelineActivity.universalIdentifier]: {
          id: TIMELINE_ACTIVITY_OBJECT_ID,
          universalIdentifier:
            STANDARD_OBJECTS.timelineActivity.universalIdentifier,
          applicationUniversalIdentifier: 'app-uid',
          nameSingular: 'timelineActivity',
          namePlural: 'timelineActivities',
          isCustom: false,
          fieldIds: fields.map(({ name }) => `field-${name}`),
          indexMetadataIds: [
            ...indexKeys.map((key) => `index-${key}`),
            ...orphanedIndexIds,
          ],
        },
        ...Object.fromEntries(
          entries(targetObjectNameSingularByKey).map(([key, nameSingular]) => [
            `object-uid-${key}`,
            {
              id: `object-${key}`,
              universalIdentifier: `object-uid-${key}`,
              nameSingular,
            },
          ]),
        ),
      },
      universalIdentifierById: {
        [TIMELINE_ACTIVITY_OBJECT_ID]:
          STANDARD_OBJECTS.timelineActivity.universalIdentifier,
        ...Object.fromEntries(
          Object.keys(targetObjectNameSingularByKey).map((key) => [
            `object-${key}`,
            `object-uid-${key}`,
          ]),
        ),
      },
      universalIdentifiersByApplicationId: {},
    },
    flatFieldMetadataMaps: {
      byUniversalIdentifier: Object.fromEntries(
        fields.map((field) => [
          `field-uid-${field.name}`,
          {
            id: `field-${field.name}`,
            universalIdentifier: `field-uid-${field.name}`,
            applicationUniversalIdentifier: 'app-uid',
            objectMetadataId: TIMELINE_ACTIVITY_OBJECT_ID,
            relationTargetObjectMetadataId: `object-${field.targetObjectKey}`,
            type: FieldMetadataType.MORPH_RELATION,
            morphId: field.morphId ?? TARGET_MORPH_ID,
            name: field.name,
            label: field.label ?? 'Stale label',
            isUnique: false,
            isSystemSideEffect: field.isSystemSideEffect ?? true,
            universalSettings: {
              relationType: field.relationType ?? RelationType.MANY_TO_ONE,
              joinColumnName: `${field.name}Id`,
            },
          },
        ]),
      ),
      universalIdentifierById: Object.fromEntries(
        fields.map(({ name }) => [`field-${name}`, `field-uid-${name}`]),
      ),
      universalIdentifiersByApplicationId: {},
    },
    flatIndexMaps: {
      byUniversalIdentifier: Object.fromEntries(
        entries(indexedFieldNamesByIndexKey).map(([key, fieldNames]) => [
          `index-uid-${key}`,
          {
            id: `index-${key}`,
            universalIdentifier: `index-uid-${key}`,
            applicationUniversalIdentifier: 'app-uid',
            objectMetadataId: TIMELINE_ACTIVITY_OBJECT_ID,
            name: `IDX_STALE_${key}`,
            isUnique: false,
            indexWhereClause: null,
            flatIndexFieldMetadatas: fieldNames.map((name, order) => ({
              fieldMetadataId: `field-${name}`,
              order,
              subFieldName: null,
            })),
            universalFlatIndexFieldMetadatas: fieldNames.map((name, order) => ({
              fieldMetadataUniversalIdentifier: `field-uid-${name}`,
              order,
              subFieldName: null,
            })),
          },
        ]),
      ),
      universalIdentifierById: Object.fromEntries(
        indexKeys.map((key) => [`index-${key}`, `index-uid-${key}`]),
      ),
      universalIdentifiersByApplicationId: {},
    },
  } as unknown as Parameters<
    typeof buildTimelineActivityTargetFieldRepairs
  >[0] &
    Pick<AllFlatEntityMaps, 'flatObjectMetadataMaps'>;
};

const staleField = {
  targetObjectNameSingularByKey: { phoneNumber: 'phoneNumber2' },
  fields: [{ name: 'targetPhoneNumber', targetObjectKey: 'phoneNumber' }],
};

// A chain: targetContact wants the name targetPhoneNumber is about to vacate.
const renameChain: BuildArgs = {
  targetObjectNameSingularByKey: {
    phoneNumber: 'phoneNumber2',
    contact: 'phoneNumber',
  },
  fields: [
    { name: 'targetPhoneNumber', targetObjectKey: 'phoneNumber' },
    { name: 'targetContact', targetObjectKey: 'contact' },
  ],
};

describe('buildTimelineActivityTargetFieldRepairs', () => {
  it('renames a stale field, its join column and its system label', () => {
    const { flatFieldMetadatasToUpdate, unrepairableTargetFields } =
      buildTimelineActivityTargetFieldRepairs(
        buildArgs({
          ...staleField,
          fields: [{ ...staleField.fields[0], label: 'PhoneNumber' }],
        }),
      );

    expect(unrepairableTargetFields).toEqual([]);
    expect(flatFieldMetadatasToUpdate).toHaveLength(1);
    expect(flatFieldMetadatasToUpdate[0]).toEqual(
      expect.objectContaining({
        name: 'targetPhoneNumber2',
        label: 'PhoneNumber2',
        universalSettings: expect.objectContaining({
          joinColumnName: 'targetPhoneNumber2Id',
        }),
      }),
    );
  });

  it('leaves a curated label untouched when the field is not a system side effect', () => {
    const { flatFieldMetadatasToUpdate } =
      buildTimelineActivityTargetFieldRepairs(
        buildArgs({
          ...staleField,
          fields: [
            {
              ...staleField.fields[0],
              label: 'Curated',
              isSystemSideEffect: false,
            },
          ],
        }),
      );

    expect(flatFieldMetadatasToUpdate[0].label).toBe('Curated');
  });

  it('does nothing when every target field already matches its object name', () => {
    const result = buildTimelineActivityTargetFieldRepairs(
      buildArgs({
        targetObjectNameSingularByKey: { phoneNumber: 'phoneNumber2' },
        fields: [
          { name: 'targetPhoneNumber2', targetObjectKey: 'phoneNumber' },
        ],
      }),
    );

    expect(result.flatFieldMetadatasToUpdate).toEqual([]);
    expect(result.unrepairableTargetFields).toEqual([]);
  });

  it('treats a rename chain identically whatever order the fields arrive in', () => {
    const summarise = (args: BuildArgs) => {
      const { flatFieldMetadatasToUpdate, unrepairableTargetFields } =
        buildTimelineActivityTargetFieldRepairs(buildArgs(args));

      return {
        renamed: flatFieldMetadatasToUpdate.map(({ name }) => name).sort(),
        blocked: unrepairableTargetFields.map(({ fieldName }) => fieldName),
      };
    };

    const forwardOrder = summarise(renameChain);
    const reversedOrder = summarise({
      ...renameChain,
      fields: [...renameChain.fields].reverse(),
    });

    expect(forwardOrder).toEqual(reversedOrder);
    // The chain cannot be applied at all: targetContact wants a name whose
    // column targetPhoneNumber is still occupying when the batch is planned.
    expect(forwardOrder.renamed).toEqual(['targetPhoneNumber2']);
    expect(forwardOrder.blocked).toEqual(['targetContact']);
  });

  it('reports a rename blocked by a field it will never rename', () => {
    const { flatFieldMetadatasToUpdate, unrepairableTargetFields } =
      buildTimelineActivityTargetFieldRepairs(
        buildArgs({
          targetObjectNameSingularByKey: {
            renamed: 'person',
            person: 'person',
          },
          fields: [
            { name: 'targetContact', targetObjectKey: 'renamed' },
            { name: 'targetPerson', targetObjectKey: 'person' },
          ],
          columnNames: ['targetContactId'],
        }),
      );

    expect(flatFieldMetadatasToUpdate).toEqual([]);
    expect(unrepairableTargetFields).toEqual([
      expect.objectContaining({
        fieldName: 'targetContact',
        expectedName: 'targetPerson',
        reason: expect.stringContaining('held by another field'),
      }),
    ]);
  });

  it('recomputes an index covering two repaired fields once, from the final names', () => {
    const { flatIndexMetadatasToUpdate } =
      buildTimelineActivityTargetFieldRepairs(
        buildArgs({
          targetObjectNameSingularByKey: { a: 'alpha2', b: 'beta2' },
          fields: [
            { name: 'targetAlpha', targetObjectKey: 'a' },
            { name: 'targetBeta', targetObjectKey: 'b' },
          ],
          indexedFieldNamesByIndexKey: {
            shared: ['targetAlpha', 'targetBeta'],
          },
        }),
      );

    expect(flatIndexMetadatasToUpdate).toHaveLength(1);
    expect(flatIndexMetadatasToUpdate[0].universalIdentifier).toBe(
      'index-uid-shared',
    );
    expect(flatIndexMetadatasToUpdate[0].name).not.toBe('IDX_STALE_shared');
  });

  it('reports orphaned index metadata instead of attempting a partial repair', () => {
    const result = buildTimelineActivityTargetFieldRepairs(
      buildArgs({
        ...staleField,
        orphanedIndexIds: ['missing-index-id'],
      }),
    );

    expect(result.flatFieldMetadatasToUpdate).toEqual([]);
    expect(result.flatIndexMetadatasToUpdate).toEqual([]);
    expect(result.unrepairableTargetFields).toEqual([
      expect.objectContaining({
        fieldName: 'targetPhoneNumber',
        expectedName: 'targetPhoneNumber2',
        reason: expect.stringContaining('missing-index-id'),
      }),
    ]);
  });

  it('refuses to repair when the expected column already exists', () => {
    const { flatFieldMetadatasToUpdate, unrepairableTargetFields } =
      buildTimelineActivityTargetFieldRepairs(
        buildArgs({ ...staleField, columnNames: ['targetPhoneNumber2Id'] }),
      );

    expect(flatFieldMetadatasToUpdate).toEqual([]);
    expect(unrepairableTargetFields[0].reason).toContain(
      'already exists while metadata still names it',
    );
  });

  it('refuses to repair when both columns exist', () => {
    const { unrepairableTargetFields } =
      buildTimelineActivityTargetFieldRepairs(
        buildArgs({
          ...staleField,
          columnNames: ['targetPhoneNumberId', 'targetPhoneNumber2Id'],
        }),
      );

    expect(unrepairableTargetFields[0].reason).toContain('both exist');
  });

  it('refuses to repair when neither column exists', () => {
    const { unrepairableTargetFields } =
      buildTimelineActivityTargetFieldRepairs(
        buildArgs({ ...staleField, columnNames: [] }),
      );

    expect(unrepairableTargetFields[0].reason).toContain('neither column');
  });

  it('ignores morph fields outside the timeline target morph', () => {
    const result = buildTimelineActivityTargetFieldRepairs(
      buildArgs({
        ...staleField,
        fields: [{ ...staleField.fields[0], morphId: 'another-morph-id' }],
      }),
    );

    expect(result.flatFieldMetadatasToUpdate).toEqual([]);
    expect(result.unrepairableTargetFields).toEqual([]);
  });

  it('ignores the one to many leg of the morph relation', () => {
    const result = buildTimelineActivityTargetFieldRepairs(
      buildArgs({
        ...staleField,
        fields: [
          { ...staleField.fields[0], relationType: RelationType.ONE_TO_MANY },
        ],
      }),
    );

    expect(result.flatFieldMetadatasToUpdate).toEqual([]);
  });
});
