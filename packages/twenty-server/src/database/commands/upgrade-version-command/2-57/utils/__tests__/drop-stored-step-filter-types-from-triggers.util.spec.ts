import { type StepFilter, ViewFilterOperand } from 'twenty-shared/types';

import { dropStoredStepFilterTypesFromTriggers } from 'src/database/commands/upgrade-version-command/2-57/utils/drop-stored-step-filter-types-from-triggers.util';

const fieldTypeById = new Map([['stage-field', 'SELECT']]);

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

const databaseEventTrigger = (stepFilters: StoredStepFilter[]) => ({
  type: 'DATABASE_EVENT',
  settings: {
    eventName: 'opportunity.updated',
    outputSchema: {},
    filter: { stepFilterGroups: [], stepFilters },
  },
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
