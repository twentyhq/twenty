import { type StepFilter, ViewFilterOperand } from 'twenty-shared/types';

import { DELETED_FIELD_TYPE } from 'src/database/commands/upgrade-version-command/2-57/utils/drop-stored-step-filter-types.util';
import { dropStoredStepFilterTypesFromSteps } from 'src/database/commands/upgrade-version-command/2-57/utils/drop-stored-step-filter-types-from-steps.util';

const fieldTypeById = new Map([
  ['stage-field', 'SELECT'],
  ['target-field', 'MORPH_RELATION'],
]);

type StoredStepFilter = StepFilter & { type?: string };

const storedFilter = (
  overrides: Partial<StoredStepFilter>,
): StoredStepFilter => ({
  id: 'filter',
  operand: ViewFilterOperand.IS,
  value: '',
  stepFilterGroupId: 'group',
  stepOutputKey: '{{trigger.properties.after.stage}}',
  ...overrides,
});

const filterStep = (stepFilters: StoredStepFilter[]) => ({
  id: 'filter-step',
  type: 'FILTER',
  settings: { input: { stepFilterGroups: [], stepFilters } },
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
