import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { buildTimelineActivityTargetFieldRepairs } from 'src/database/commands/upgrade-version-command/2-35/utils/build-timeline-activity-target-field-repairs.util';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';

const TIMELINE_ACTIVITY_OBJECT_ID = '00000000-0000-4000-8000-000000000002';
const APPLICATION_UNIVERSAL_IDENTIFIER = '00000000-0000-4000-8000-000000000007';
const TARGET_MORPH_ID =
  STANDARD_OBJECTS.timelineActivity.morphIds.targetMorphId.morphId;

type TargetObjectFixture = {
  nameSingular: string;
};

type TargetFieldFixture = {
  name: string;
  joinColumnName: string;
  targetObjectKey: string;
  morphId?: string;
  relationType?: RelationType;
  label?: string;
  isSystemSideEffect?: boolean;
  withIndex?: boolean;
};

const objectId = (key: string) => `object-id-${key}`;
const objectUniversalIdentifier = (key: string) => `object-uid-${key}`;
const fieldId = (name: string) => `field-id-${name}`;
const fieldUniversalIdentifier = (name: string) => `field-uid-${name}`;
const indexId = (name: string) => `index-id-${name}`;
const indexUniversalIdentifier = (name: string) => `index-uid-${name}`;

const buildFlatEntityMaps = ({
  targetObjects,
  targetFields,
  includeTimelineActivityObject = true,
}: {
  targetObjects: Record<string, TargetObjectFixture>;
  targetFields: TargetFieldFixture[];
  includeTimelineActivityObject?: boolean;
}) => {
  const indexedFields = targetFields.filter(
    ({ withIndex }) => withIndex === true,
  );

  const timelineActivityFlatObjectMetadata = {
    id: TIMELINE_ACTIVITY_OBJECT_ID,
    universalIdentifier: STANDARD_OBJECTS.timelineActivity.universalIdentifier,
    applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    nameSingular: 'timelineActivity',
    namePlural: 'timelineActivities',
    isCustom: false,
    fieldIds: targetFields.map(({ name }) => fieldId(name)),
    indexMetadataIds: indexedFields.map(({ name }) => indexId(name)),
  };

  const flatObjectMetadataMaps = {
    byUniversalIdentifier: {
      ...(includeTimelineActivityObject
        ? {
            [STANDARD_OBJECTS.timelineActivity.universalIdentifier]:
              timelineActivityFlatObjectMetadata,
          }
        : {}),
      ...Object.fromEntries(
        Object.entries(targetObjects).map(([key, { nameSingular }]) => [
          objectUniversalIdentifier(key),
          {
            id: objectId(key),
            universalIdentifier: objectUniversalIdentifier(key),
            applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
            nameSingular,
          },
        ]),
      ),
    },
    universalIdentifierById: {
      ...(includeTimelineActivityObject
        ? {
            [TIMELINE_ACTIVITY_OBJECT_ID]:
              STANDARD_OBJECTS.timelineActivity.universalIdentifier,
          }
        : {}),
      ...Object.fromEntries(
        Object.keys(targetObjects).map((key) => [
          objectId(key),
          objectUniversalIdentifier(key),
        ]),
      ),
    },
    universalIdentifiersByApplicationId: {},
  };

  const flatFieldMetadataMaps = {
    byUniversalIdentifier: Object.fromEntries(
      targetFields.map((targetField) => [
        fieldUniversalIdentifier(targetField.name),
        {
          id: fieldId(targetField.name),
          universalIdentifier: fieldUniversalIdentifier(targetField.name),
          applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
          objectMetadataId: TIMELINE_ACTIVITY_OBJECT_ID,
          relationTargetObjectMetadataId: objectId(targetField.targetObjectKey),
          type: FieldMetadataType.MORPH_RELATION,
          morphId: targetField.morphId ?? TARGET_MORPH_ID,
          name: targetField.name,
          label: targetField.label ?? 'Stale label',
          isUnique: false,
          isSystemSideEffect: targetField.isSystemSideEffect ?? true,
          universalSettings: {
            relationType: targetField.relationType ?? RelationType.MANY_TO_ONE,
            joinColumnName: targetField.joinColumnName,
          },
        },
      ]),
    ),
    universalIdentifierById: Object.fromEntries(
      targetFields.map(({ name }) => [
        fieldId(name),
        fieldUniversalIdentifier(name),
      ]),
    ),
    universalIdentifiersByApplicationId: {},
  };

  const flatIndexMaps = {
    byUniversalIdentifier: Object.fromEntries(
      indexedFields.map(({ name }) => [
        indexUniversalIdentifier(name),
        {
          id: indexId(name),
          universalIdentifier: indexUniversalIdentifier(name),
          applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
          objectMetadataId: TIMELINE_ACTIVITY_OBJECT_ID,
          name: `IDX_STALE_${name}`,
          isUnique: false,
          indexWhereClause: null,
          flatIndexFieldMetadatas: [
            { fieldMetadataId: fieldId(name), order: 0, subFieldName: null },
          ],
          universalFlatIndexFieldMetadatas: [
            {
              fieldMetadataUniversalIdentifier: fieldUniversalIdentifier(name),
              order: 0,
              subFieldName: null,
            },
          ],
        },
      ]),
    ),
    universalIdentifierById: Object.fromEntries(
      indexedFields.map(({ name }) => [
        indexId(name),
        indexUniversalIdentifier(name),
      ]),
    ),
    universalIdentifiersByApplicationId: {},
  };

  return {
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    flatIndexMaps,
  } as unknown as Pick<
    AllFlatEntityMaps,
    'flatObjectMetadataMaps' | 'flatFieldMetadataMaps' | 'flatIndexMaps'
  >;
};

describe('buildTimelineActivityTargetFieldRepairs', () => {
  it('renames a stale target field and its join column from current object metadata', () => {
    const { repairs, skippedRepairs } = buildTimelineActivityTargetFieldRepairs(
      buildFlatEntityMaps({
        targetObjects: { phoneNumber: { nameSingular: 'phoneNumber2' } },
        targetFields: [
          {
            name: 'targetPhoneNumber',
            joinColumnName: 'targetPhoneNumberId',
            targetObjectKey: 'phoneNumber',
          },
        ],
      }),
    );

    expect(skippedRepairs).toEqual([]);
    expect(repairs).toHaveLength(1);
    expect(repairs[0].flatFieldMetadataToUpdate.name).toBe(
      'targetPhoneNumber2',
    );
    expect(
      repairs[0].flatFieldMetadataToUpdate.universalSettings.joinColumnName,
    ).toBe('targetPhoneNumber2Id');
  });

  it('realigns the label of a system side effect field with the target object name', () => {
    const { repairs } = buildTimelineActivityTargetFieldRepairs(
      buildFlatEntityMaps({
        targetObjects: { phoneNumber: { nameSingular: 'phoneNumber2' } },
        targetFields: [
          {
            name: 'targetPhoneNumber',
            joinColumnName: 'targetPhoneNumberId',
            targetObjectKey: 'phoneNumber',
            label: 'PhoneNumber',
          },
        ],
      }),
    );

    expect(repairs[0].flatFieldMetadataToUpdate.label).toBe('PhoneNumber2');
  });

  it('leaves the label untouched when the field is not a system side effect', () => {
    const { repairs } = buildTimelineActivityTargetFieldRepairs(
      buildFlatEntityMaps({
        targetObjects: { phoneNumber: { nameSingular: 'phoneNumber2' } },
        targetFields: [
          {
            name: 'targetPhoneNumber',
            joinColumnName: 'targetPhoneNumberId',
            targetObjectKey: 'phoneNumber',
            label: 'Curated label',
            isSystemSideEffect: false,
          },
        ],
      }),
    );

    expect(repairs[0].flatFieldMetadataToUpdate.label).toBe('Curated label');
  });

  it('recomputes the name of the indexes covering the renamed join column', () => {
    const { repairs } = buildTimelineActivityTargetFieldRepairs(
      buildFlatEntityMaps({
        targetObjects: { phoneNumber: { nameSingular: 'phoneNumber2' } },
        targetFields: [
          {
            name: 'targetPhoneNumber',
            joinColumnName: 'targetPhoneNumberId',
            targetObjectKey: 'phoneNumber',
            withIndex: true,
          },
        ],
      }),
    );

    expect(repairs[0].flatIndexMetadatasToUpdate).toHaveLength(1);
    expect(repairs[0].flatIndexMetadatasToUpdate[0].name).not.toBe(
      'IDX_STALE_targetPhoneNumber',
    );
    expect(repairs[0].flatIndexMetadatasToUpdate[0].universalIdentifier).toBe(
      indexUniversalIdentifier('targetPhoneNumber'),
    );
  });

  it('does nothing when the target field already matches the object name', () => {
    const { repairs, skippedRepairs } = buildTimelineActivityTargetFieldRepairs(
      buildFlatEntityMaps({
        targetObjects: { phoneNumber: { nameSingular: 'phoneNumber2' } },
        targetFields: [
          {
            name: 'targetPhoneNumber2',
            joinColumnName: 'targetPhoneNumber2Id',
            targetObjectKey: 'phoneNumber',
          },
        ],
      }),
    );

    expect(repairs).toEqual([]);
    expect(skippedRepairs).toEqual([]);
  });

  it('skips instead of repairing a join column that drifted on its own', () => {
    const { repairs, skippedRepairs } = buildTimelineActivityTargetFieldRepairs(
      buildFlatEntityMaps({
        targetObjects: { phoneNumber: { nameSingular: 'phoneNumber2' } },
        targetFields: [
          {
            name: 'targetPhoneNumber2',
            joinColumnName: 'targetPhoneNumberId',
            targetObjectKey: 'phoneNumber',
          },
        ],
      }),
    );

    expect(repairs).toEqual([]);
    expect(skippedRepairs).toEqual([
      'targetPhoneNumber2 (join column is targetPhoneNumberId, expected targetPhoneNumber2Id, needs manual repair)',
    ]);
  });

  it('skips a rename that would collide with a field already holding the name', () => {
    const { repairs, skippedRepairs } = buildTimelineActivityTargetFieldRepairs(
      buildFlatEntityMaps({
        targetObjects: {
          renamed: { nameSingular: 'person' },
          person: { nameSingular: 'person' },
        },
        targetFields: [
          {
            name: 'targetContact',
            joinColumnName: 'targetContactId',
            targetObjectKey: 'renamed',
          },
          {
            name: 'targetPerson',
            joinColumnName: 'targetPersonId',
            targetObjectKey: 'person',
          },
        ],
      }),
    );

    expect(repairs).toEqual([]);
    expect(skippedRepairs).toEqual([
      'targetContact -> targetPerson (name already taken on timelineActivity)',
    ]);
  });

  it('lets a later candidate reuse a name freed by an accepted rename', () => {
    const { repairs, skippedRepairs } = buildTimelineActivityTargetFieldRepairs(
      buildFlatEntityMaps({
        targetObjects: {
          phoneNumber: { nameSingular: 'phoneNumber2' },
          contact: { nameSingular: 'phoneNumber' },
        },
        targetFields: [
          {
            name: 'targetPhoneNumber',
            joinColumnName: 'targetPhoneNumberId',
            targetObjectKey: 'phoneNumber',
          },
          {
            name: 'targetContact',
            joinColumnName: 'targetContactId',
            targetObjectKey: 'contact',
          },
        ],
      }),
    );

    expect(skippedRepairs).toEqual([]);
    expect(
      repairs.map(({ flatFieldMetadataToUpdate }) => [
        flatFieldMetadataToUpdate.universalIdentifier,
        flatFieldMetadataToUpdate.name,
      ]),
    ).toEqual([
      [fieldUniversalIdentifier('targetPhoneNumber'), 'targetPhoneNumber2'],
      [fieldUniversalIdentifier('targetContact'), 'targetPhoneNumber'],
    ]);
  });

  it('ignores morph fields outside the timeline target morph', () => {
    const { repairs, skippedRepairs } = buildTimelineActivityTargetFieldRepairs(
      buildFlatEntityMaps({
        targetObjects: { phoneNumber: { nameSingular: 'phoneNumber2' } },
        targetFields: [
          {
            name: 'targetPhoneNumber',
            joinColumnName: 'targetPhoneNumberId',
            targetObjectKey: 'phoneNumber',
            morphId: '00000000-0000-4000-8000-000000000008',
          },
        ],
      }),
    );

    expect(repairs).toEqual([]);
    expect(skippedRepairs).toEqual([]);
  });

  it('ignores the one to many leg of the morph relation', () => {
    const { repairs } = buildTimelineActivityTargetFieldRepairs(
      buildFlatEntityMaps({
        targetObjects: { phoneNumber: { nameSingular: 'phoneNumber2' } },
        targetFields: [
          {
            name: 'targetPhoneNumber',
            joinColumnName: 'targetPhoneNumberId',
            targetObjectKey: 'phoneNumber',
            relationType: RelationType.ONE_TO_MANY,
          },
        ],
      }),
    );

    expect(repairs).toEqual([]);
  });

  it('returns nothing when the workspace has no timeline activity object', () => {
    const { repairs, skippedRepairs } = buildTimelineActivityTargetFieldRepairs(
      buildFlatEntityMaps({
        targetObjects: { phoneNumber: { nameSingular: 'phoneNumber2' } },
        targetFields: [
          {
            name: 'targetPhoneNumber',
            joinColumnName: 'targetPhoneNumberId',
            targetObjectKey: 'phoneNumber',
          },
        ],
        includeTimelineActivityObject: false,
      }),
    );

    expect(repairs).toEqual([]);
    expect(skippedRepairs).toEqual([]);
  });

  it('ignores a field whose target object is gone', () => {
    const { repairs, skippedRepairs } = buildTimelineActivityTargetFieldRepairs(
      buildFlatEntityMaps({
        targetObjects: {},
        targetFields: [
          {
            name: 'targetPhoneNumber',
            joinColumnName: 'targetPhoneNumberId',
            targetObjectKey: 'phoneNumber',
          },
        ],
      }),
    );

    expect(repairs).toEqual([]);
    expect(skippedRepairs).toEqual([]);
  });
});
