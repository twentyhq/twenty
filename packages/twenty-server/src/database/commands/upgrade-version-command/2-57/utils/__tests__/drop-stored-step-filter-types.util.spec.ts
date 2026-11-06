import {
  DELETED_FIELD_TYPE,
  dropStoredStepFilterTypesFromSteps,
  dropStoredStepFilterTypesFromTrigger,
  dropStoredStepFilterTypesFromTriggers,
} from 'src/database/commands/upgrade-version-command/2-57/utils/drop-stored-step-filter-types.util';

const fieldTypeById = new Map([
  ['stage-field', 'SELECT'],
  ['target-field', 'MORPH_RELATION'],
]);

const storedFilter = (overrides: Record<string, unknown>) => ({
  id: 'filter',
  operand: 'IS',
  value: '',
  stepFilterGroupId: 'group',
  stepOutputKey: '{{trigger.properties.after.stage}}',
  ...overrides,
});

const filterStep = (stepFilters: unknown[], type = 'FILTER') => ({
  id: `${type}-step`,
  type,
  settings: { input: { stepFilterGroups: [], stepFilters } },
});

const CODE_STEP = {
  id: 'code-step',
  type: 'CODE',
  settings: {
    outputSchema: {
      isPersonal: {
        isLeaf: true,
        type: 'boolean',
        label: 'isPersonal',
        value: true,
      },
    },
  },
};

describe('dropStoredStepFilterTypesFromSteps', () => {
  it('should drop the stored type and report nothing when it matches what runs compute', () => {
    const result = dropStoredStepFilterTypesFromSteps({
      steps: [
        CODE_STEP,
        filterStep([
          storedFilter({ type: 'SELECT', fieldMetadataId: 'stage-field' }),
          storedFilter({
            id: 'is-personal',
            type: 'boolean',
            stepOutputKey: '{{code-step.isPersonal}}',
          }),
          storedFilter({
            id: 'target',
            type: 'RELATION',
            fieldMetadataId: 'target-field',
          }),
        ]),
      ],
      fieldTypeById,
    });

    expect(result.hasChanged).toBe(true);
    expect(result.typeChanges).toEqual([]);
    expect(result.value).toEqual([
      CODE_STEP,
      filterStep([
        storedFilter({ fieldMetadataId: 'stage-field' }),
        storedFilter({
          id: 'is-personal',
          stepOutputKey: '{{code-step.isPersonal}}',
        }),
        storedFilter({ id: 'target', fieldMetadataId: 'target-field' }),
      ]),
    ]);
  });

  it('should report filters that compare differently from now on', () => {
    const { typeChanges } = dropStoredStepFilterTypesFromSteps({
      steps: [
        CODE_STEP,
        filterStep(
          [
            storedFilter({ type: 'TEXT', fieldMetadataId: 'stage-field' }),
            storedFilter({
              id: 'is-personal',
              type: 'string',
              stepOutputKey: '{{code-step.isPersonal}}',
            }),
            storedFilter({
              id: 'deleted',
              type: 'TEXT',
              fieldMetadataId: 'deleted-field',
            }),
          ],
          'IF_ELSE',
        ),
      ],
      fieldTypeById,
    });

    expect(typeChanges).toEqual([
      {
        stepId: 'IF_ELSE-step',
        stepFilterId: 'filter',
        storedType: 'TEXT',
        computedType: 'SELECT',
      },
      {
        stepId: 'IF_ELSE-step',
        stepFilterId: 'is-personal',
        storedType: 'string',
        computedType: 'boolean',
      },
      {
        stepId: 'IF_ELSE-step',
        stepFilterId: 'deleted',
        storedType: 'TEXT',
        computedType: DELETED_FIELD_TYPE,
      },
    ]);
  });

  it('should leave steps without a stored type unchanged', () => {
    const steps = [
      filterStep([storedFilter({ fieldMetadataId: 'stage-field' })]),
      { id: 'code', type: 'CODE', settings: { input: { type: 'kept' } } },
    ];

    expect(
      dropStoredStepFilterTypesFromSteps({ steps, fieldTypeById }),
    ).toEqual({ value: steps, hasChanged: false, typeChanges: [] });
    expect(
      dropStoredStepFilterTypesFromSteps({ steps: null, fieldTypeById }),
    ).toEqual({ value: null, hasChanged: false, typeChanges: [] });
  });
});

describe('dropStoredStepFilterTypesFromTrigger', () => {
  const databaseEventTrigger = (stepFilters: unknown[]) => ({
    type: 'DATABASE_EVENT',
    settings: {
      eventName: 'opportunity.updated',
      outputSchema: {},
      filter: { stepFilterGroups: [], stepFilters },
    },
  });

  it('should drop the stored type of database event trigger filters', () => {
    expect(
      dropStoredStepFilterTypesFromTrigger({
        trigger: databaseEventTrigger([
          storedFilter({ type: 'SELECT', fieldMetadataId: 'stage-field' }),
        ]),
        fieldTypeById,
      }),
    ).toEqual({
      value: databaseEventTrigger([
        storedFilter({ fieldMetadataId: 'stage-field' }),
      ]),
      hasChanged: true,
      typeChanges: [],
    });
  });

  it('should rewrite each trigger of a core version', () => {
    const manualTrigger = { type: 'MANUAL', settings: { outputSchema: {} } };

    expect(
      dropStoredStepFilterTypesFromTriggers({
        triggers: [
          databaseEventTrigger([
            storedFilter({ type: 'TEXT', fieldMetadataId: 'stage-field' }),
          ]),
          manualTrigger,
        ],
        fieldTypeById,
      }),
    ).toEqual({
      value: [
        databaseEventTrigger([
          storedFilter({ fieldMetadataId: 'stage-field' }),
        ]),
        manualTrigger,
      ],
      hasChanged: true,
      typeChanges: [
        {
          stepId: 'trigger',
          stepFilterId: 'filter',
          storedType: 'TEXT',
          computedType: 'SELECT',
        },
      ],
    });
  });
});
