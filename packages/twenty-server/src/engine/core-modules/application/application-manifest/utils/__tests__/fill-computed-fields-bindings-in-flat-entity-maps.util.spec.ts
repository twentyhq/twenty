import {
  type FieldMetadataComputation,
  FieldMetadataType,
  RelationType,
} from 'twenty-shared/types';

import { fillComputedFieldsBindingsInFlatEntityMaps } from 'src/engine/core-modules/application/application-manifest/utils/fill-computed-fields-bindings-in-flat-entity-maps.util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';

const PROJECT_OBJECT_UID = 'project-object';
const TASK_OBJECT_UID = 'task-object';

const buildField = ({
  universalIdentifier,
  name,
  objectUniversalIdentifier = PROJECT_OBJECT_UID,
  computation = null,
}: {
  universalIdentifier: string;
  name: string;
  objectUniversalIdentifier?: string;
  computation?: FieldMetadataComputation | null;
}) =>
  getFlatFieldMetadataMock({
    universalIdentifier,
    objectMetadataId: `${objectUniversalIdentifier}-id`,
    objectMetadataUniversalIdentifier: objectUniversalIdentifier,
    type: FieldMetadataType.NUMBER,
    name,
    computation,
  });

const buildRelationField = ({
  universalIdentifier,
  name,
  objectUniversalIdentifier,
  relationType,
  targetObjectUniversalIdentifier,
  targetFieldUniversalIdentifier,
}: {
  universalIdentifier: string;
  name: string;
  objectUniversalIdentifier: string;
  relationType: RelationType;
  targetObjectUniversalIdentifier: string;
  targetFieldUniversalIdentifier: string;
}) =>
  getFlatFieldMetadataMock({
    universalIdentifier,
    objectMetadataId: `${objectUniversalIdentifier}-id`,
    objectMetadataUniversalIdentifier: objectUniversalIdentifier,
    type: FieldMetadataType.RELATION,
    name,
    universalSettings: { relationType },
    relationTargetObjectMetadataUniversalIdentifier:
      targetObjectUniversalIdentifier,
    relationTargetFieldMetadataUniversalIdentifier:
      targetFieldUniversalIdentifier,
  });

type WorkspaceFieldNames = {
  budget: string;
  tasks: string;
  points: string;
  status: string;
};

const fillManifestComputation = ({
  manifestComputation,
  savedComputation,
  workspaceFieldNames,
}: {
  manifestComputation: FieldMetadataComputation;
  savedComputation?: FieldMetadataComputation;
  workspaceFieldNames?: Partial<WorkspaceFieldNames>;
}) => {
  const { budget, tasks, points, status }: WorkspaceFieldNames = {
    budget: 'budget',
    tasks: 'tasks',
    points: 'points',
    status: 'status',
    ...workspaceFieldNames,
  };
  const toAllUniversalFlatEntityMaps = {
    flatObjectMetadataMaps: createEmptyFlatEntityMaps(),
    flatFieldMetadataMaps: {
      ...createEmptyFlatEntityMaps(),
      byUniversalIdentifier: {
        'bonus-field': buildField({
          universalIdentifier: 'bonus-field',
          name: 'bonus',
        }),
        'total-field': buildField({
          universalIdentifier: 'total-field',
          name: 'total',
          computation: manifestComputation,
        }),
      },
    },
  };

  fillComputedFieldsBindingsInFlatEntityMaps({
    existingAllFlatEntityMaps: {
      flatObjectMetadataMaps: {
        ...createEmptyFlatEntityMaps(),
        byUniversalIdentifier: {
          [PROJECT_OBJECT_UID]: getFlatObjectMetadataMock({
            universalIdentifier: PROJECT_OBJECT_UID,
          }),
          [TASK_OBJECT_UID]: getFlatObjectMetadataMock({
            universalIdentifier: TASK_OBJECT_UID,
          }),
        },
      },
      flatFieldMetadataMaps: {
        ...createEmptyFlatEntityMaps(),
        byUniversalIdentifier: {
          'budget-field': buildField({
            universalIdentifier: 'budget-field',
            name: budget,
          }),
          // Renamed by the manifest: the manifest name wins
          'bonus-field': buildField({
            universalIdentifier: 'bonus-field',
            name: 'extra',
          }),
          'tasks-field': buildRelationField({
            universalIdentifier: 'tasks-field',
            name: tasks,
            objectUniversalIdentifier: PROJECT_OBJECT_UID,
            relationType: RelationType.ONE_TO_MANY,
            targetObjectUniversalIdentifier: TASK_OBJECT_UID,
            targetFieldUniversalIdentifier: 'project-field',
          }),
          'project-field': buildRelationField({
            universalIdentifier: 'project-field',
            name: 'project',
            objectUniversalIdentifier: TASK_OBJECT_UID,
            relationType: RelationType.MANY_TO_ONE,
            targetObjectUniversalIdentifier: PROJECT_OBJECT_UID,
            targetFieldUniversalIdentifier: 'tasks-field',
          }),
          'points-field': buildField({
            universalIdentifier: 'points-field',
            name: points,
            objectUniversalIdentifier: TASK_OBJECT_UID,
          }),
          'status-field': buildField({
            universalIdentifier: 'status-field',
            name: status,
            objectUniversalIdentifier: TASK_OBJECT_UID,
          }),
          ...(savedComputation
            ? {
                'total-field': buildField({
                  universalIdentifier: 'total-field',
                  name: 'total',
                  computation: savedComputation,
                }),
              }
            : {}),
        },
      },
    },
    toAllUniversalFlatEntityMaps,
  });

  return toAllUniversalFlatEntityMaps.flatFieldMetadataMaps
    .byUniversalIdentifier['total-field'].computation;
};

const MANIFEST_ROLLUP: FieldMetadataComputation = {
  kind: 'ROLLUP',
  relationFieldName: 'tasks',
  operation: 'SUM',
  expression: 'points',
  filter: "status != 'points'",
};

const SAVED_ROLLUP: FieldMetadataComputation = {
  kind: 'ROLLUP',
  relationFieldName: 'todos',
  operation: 'SUM',
  expression: 'effort',
  filter: "state != 'points'",
  bindings: {
    todos: 'tasks-field',
    'todos.effort': 'points-field',
    'todos.state': 'status-field',
  },
};

const RENAMED_ROLLUP_FIELD_NAMES = {
  tasks: 'todos',
  points: 'effort',
  status: 'state',
};

describe('fillComputedFieldsBindingsInFlatEntityMaps', () => {
  it('binds a manifest computation to workspace and manifest fields, replacing the bindings it came with', () => {
    expect(
      fillManifestComputation({
        manifestComputation: {
          kind: 'FORMULA',
          expression: 'budget + bonus',
          bindings: { budget: 'from-the-manifest' },
        },
      }),
    ).toEqual({
      kind: 'FORMULA',
      expression: 'budget + bonus',
      bindings: { budget: 'budget-field', bonus: 'bonus-field' },
    });
  });

  it('leaves a computation that does not resolve without bindings, for validation to report', () => {
    expect(
      fillManifestComputation({
        manifestComputation: {
          kind: 'FORMULA',
          expression: 'budget + extra',
          bindings: { budget: 'from-the-manifest' },
        },
      }),
    ).toEqual({ kind: 'FORMULA', expression: 'budget + extra' });
  });

  describe('when the workspace renamed a field the saved computation reads', () => {
    it('keeps the saved formula, with the manifest name of a field of the application', () => {
      expect(
        fillManifestComputation({
          manifestComputation: {
            kind: 'FORMULA',
            expression: 'budget + bonus',
          },
          savedComputation: {
            kind: 'FORMULA',
            expression: 'cost + extra',
            bindings: { cost: 'budget-field', extra: 'bonus-field' },
          },
          workspaceFieldNames: { budget: 'cost' },
        }),
      ).toEqual({
        kind: 'FORMULA',
        expression: 'cost + bonus',
        bindings: { cost: 'budget-field', bonus: 'bonus-field' },
      });
    });

    it('keeps the relation, expression and filter of the saved rollup', () => {
      expect(
        fillManifestComputation({
          manifestComputation: MANIFEST_ROLLUP,
          savedComputation: SAVED_ROLLUP,
          workspaceFieldNames: RENAMED_ROLLUP_FIELD_NAMES,
        }),
      ).toEqual(SAVED_ROLLUP);
    });

    it.each<[string, FieldMetadataComputation, FieldMetadataComputation]>([
      [
        'formula',
        { kind: 'FORMULA', expression: 'budget * 3' },
        {
          kind: 'FORMULA',
          expression: 'cost * 2',
          bindings: { cost: 'budget-field' },
        },
      ],
      [
        'formula path',
        { kind: 'FORMULA', expression: 'budget.amount * 2' },
        {
          kind: 'FORMULA',
          expression: 'cost * 2',
          bindings: { cost: 'budget-field' },
        },
      ],
      [
        'rollup operation',
        { ...MANIFEST_ROLLUP, operation: 'AVG' },
        SAVED_ROLLUP,
      ],
      [
        'rollup expression',
        { ...MANIFEST_ROLLUP, expression: 'points * 2' },
        SAVED_ROLLUP,
      ],
      [
        'rollup filter',
        { ...MANIFEST_ROLLUP, filter: "status == 'points'" },
        SAVED_ROLLUP,
      ],
      [
        'kind of computation',
        { kind: 'FORMULA', expression: 'points' },
        SAVED_ROLLUP,
      ],
    ])(
      'lets a manifest that changed the %s win, for validation to report',
      (_change, manifestComputation, savedComputation) => {
        expect(
          fillManifestComputation({
            manifestComputation,
            savedComputation,
            workspaceFieldNames: {
              budget: 'cost',
              ...RENAMED_ROLLUP_FIELD_NAMES,
            },
          }),
        ).toEqual(manifestComputation);
      },
    );

    it('lets a manifest computation that resolves win', () => {
      expect(
        fillManifestComputation({
          manifestComputation: { kind: 'FORMULA', expression: 'bonus * 2' },
          savedComputation: {
            kind: 'FORMULA',
            expression: 'extra * 2',
            bindings: { extra: 'bonus-field' },
          },
        }),
      ).toEqual({
        kind: 'FORMULA',
        expression: 'bonus * 2',
        bindings: { bonus: 'bonus-field' },
      });
    });
  });
});
