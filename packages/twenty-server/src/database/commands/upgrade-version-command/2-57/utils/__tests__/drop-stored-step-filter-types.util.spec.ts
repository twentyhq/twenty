import {
  DELETED_FIELD_TYPE,
  dropStoredStepFilterTypesFromSteps,
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

const filterStep = (stepFilters: unknown[]) => ({
  id: 'filter-step',
  type: 'FILTER',
  settings: { input: { stepFilterGroups: [], stepFilters } },
});

const databaseEventTrigger = (stepFilters: unknown[]) => ({
  type: 'DATABASE_EVENT',
  settings: {
    eventName: 'opportunity.updated',
    outputSchema: {},
    filter: { stepFilterGroups: [], stepFilters },
  },
});

describe('dropStoredStepFilterTypesFromSteps', () => {
  it('should drop the stored type and report the field filters that compare differently', () => {
    const result = dropStoredStepFilterTypesFromSteps({
      steps: [
        filterStep([
          storedFilter({ type: 'SELECT', fieldMetadataId: 'stage-field' }),
          storedFilter({
            id: 'target',
            type: 'RELATION',
            fieldMetadataId: 'target-field',
          }),
          storedFilter({
            id: 'stale',
            type: 'TEXT',
            fieldMetadataId: 'stage-field',
          }),
          storedFilter({
            id: 'deleted',
            type: 'TEXT',
            fieldMetadataId: 'deleted-field',
          }),
          storedFilter({
            id: 'variable',
            type: 'number',
            stepOutputKey: '{{code-step.total}}',
          }),
        ]),
      ],
      fieldTypeById,
    });

    expect(result.value).toEqual([
      filterStep([
        storedFilter({ fieldMetadataId: 'stage-field' }),
        storedFilter({ id: 'target', fieldMetadataId: 'target-field' }),
        storedFilter({ id: 'stale', fieldMetadataId: 'stage-field' }),
        storedFilter({ id: 'deleted', fieldMetadataId: 'deleted-field' }),
        storedFilter({ id: 'variable', stepOutputKey: '{{code-step.total}}' }),
      ]),
    ]);
    expect(result.typeChanges).toEqual([
      {
        stepId: 'filter-step',
        stepFilterId: 'stale',
        storedType: 'TEXT',
        computedType: 'SELECT',
      },
      {
        stepId: 'filter-step',
        stepFilterId: 'deleted',
        storedType: 'TEXT',
        computedType: DELETED_FIELD_TYPE,
      },
    ]);
    expect(result.variableFilterCount).toBe(1);
  });

  it('should leave steps without a stored type unchanged', () => {
    const steps = [
      filterStep([storedFilter({ fieldMetadataId: 'stage-field' })]),
    ];

    expect(
      dropStoredStepFilterTypesFromSteps({ steps, fieldTypeById }),
    ).toMatchObject({ value: steps, hasChanged: false });
  });
});

describe('dropStoredStepFilterTypesFromTriggers', () => {
  it('should drop the stored type of database event trigger filters', () => {
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
      variableFilterCount: 0,
    });
  });
});
