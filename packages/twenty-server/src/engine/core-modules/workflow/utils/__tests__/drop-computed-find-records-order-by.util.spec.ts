import { WorkflowActionType } from 'twenty-shared/workflow';

import { dropComputedFindRecordsOrderBy } from 'src/engine/core-modules/workflow/utils/drop-computed-find-records-order-by.util';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const RECORD_SORTS = [{ fieldMetadataId: 'field-id', direction: 'DESC' }];

const findRecordsStep = (orderBy: Record<string, unknown>) =>
  ({
    id: 'find-step',
    name: 'Find companies',
    type: WorkflowActionType.FIND_RECORDS,
    valid: true,
    settings: {
      outputSchema: {},
      errorHandlingOptions: {
        retryOnFailure: { value: 0 },
        continueOnFailure: { value: false },
      },
      input: { objectName: 'company', orderBy },
    },
  }) as WorkflowAction;

describe('dropComputedFindRecordsOrderBy', () => {
  it('keeps only the record sorts when the computed order comes with them', () => {
    const [step] =
      dropComputedFindRecordsOrderBy([
        findRecordsStep({
          recordSorts: RECORD_SORTS,
          gqlOperationOrderBy: [{ name: 'DescNullsLast' }],
        }),
      ]) ?? [];

    expect(step).toEqual(findRecordsStep({ recordSorts: RECORD_SORTS }));
  });

  it('leaves an order without record sorts for validation to refuse', () => {
    const steps = [
      findRecordsStep({ gqlOperationOrderBy: [{ name: 'DescNullsLast' }] }),
    ];

    expect(dropComputedFindRecordsOrderBy(steps)).toEqual(steps);
  });

  it('leaves steps without a computed order untouched', () => {
    const steps = [findRecordsStep({ recordSorts: RECORD_SORTS })];

    expect(dropComputedFindRecordsOrderBy(steps)).toEqual(steps);
    expect(dropComputedFindRecordsOrderBy(null)).toBeNull();
  });
});
