import { FieldMetadataType } from 'twenty-shared/types';

import {
  moveFindRecordsSortsToRecordSorts,
  type SortableField,
} from 'src/database/commands/upgrade-version-command/2-57/utils/move-find-records-sorts-to-record-sorts.util';

const STATUS: SortableField = {
  id: 'status-field-id',
  name: 'status',
  type: FieldMetadataType.SELECT,
};
const NAME: SortableField = {
  id: 'name-field-id',
  name: 'name',
  type: FieldMetadataType.FULL_NAME,
};
const COMPANY: SortableField = {
  id: 'company-field-id',
  name: 'company',
  type: FieldMetadataType.RELATION,
  relationTargetLabelFieldName: 'name',
};
const SALARY: SortableField = {
  id: 'salary-field-id',
  name: 'salary',
  type: FieldMetadataType.CURRENCY,
};

const fieldsByObjectName = new Map([
  ['person', [STATUS, NAME, COMPANY, SALARY]],
]);

const findRecordsStep = (orderBy: Record<string, unknown>) => ({
  id: 'step-id',
  type: 'FIND_RECORDS',
  settings: { input: { objectName: 'person', limit: 1, orderBy } },
});

const convert = (orderBy: Record<string, unknown>) =>
  moveFindRecordsSortsToRecordSorts({
    steps: [findRecordsStep(orderBy)],
    fieldsByObjectName,
  });

const recordSortsOf = (steps: unknown) =>
  (steps as ReturnType<typeof findRecordsStep>[])[0].settings.input.orderBy
    .recordSorts;

describe('moveFindRecordsSortsToRecordSorts', () => {
  it('drops the GraphQL order the builder computed next to its record sorts', () => {
    const recordSorts = [
      { id: 'sort-id', fieldMetadataId: STATUS.id, direction: 'DESC' },
    ];

    const { steps, hasChanged, inexactlyConvertedSorts } = convert({
      recordSorts,
      gqlOperationOrderBy: [
        { status: 'DescNullsLast' },
        { position: 'AscNullsFirst' },
      ],
    });

    expect(hasChanged).toBe(true);
    expect(inexactlyConvertedSorts).toEqual([]);
    expect(
      (steps as ReturnType<typeof findRecordsStep>[])[0].settings.input.orderBy,
    ).toEqual({ recordSorts });
  });

  it('converts a GraphQL order written through the API into record sorts', () => {
    const { steps, inexactlyConvertedSorts } = convert({
      gqlOperationOrderBy: [
        { status: 'DescNullsLast' },
        { name: { lastName: 'AscNullsLast' } },
        { name: { firstName: 'AscNullsLast' } },
        { company: { name: 'AscNullsLast' } },
        { position: 'AscNullsFirst' },
      ],
    });

    expect(inexactlyConvertedSorts).toEqual([]);
    expect(recordSortsOf(steps)).toEqual([
      expect.objectContaining({
        fieldMetadataId: STATUS.id,
        direction: 'DESC',
      }),
      expect.objectContaining({
        fieldMetadataId: NAME.id,
        direction: 'ASC',
        subFieldName: 'lastName',
      }),
      expect.objectContaining({
        fieldMetadataId: COMPANY.id,
        direction: 'ASC',
      }),
    ]);
  });

  it('gives converted sorts the same ids each time it runs', () => {
    const orderBy = { gqlOperationOrderBy: [{ status: 'DescNullsLast' }] };

    expect(recordSortsOf(convert(orderBy).steps)).toEqual(
      recordSortsOf(convert(orderBy).steps),
    );
  });

  it('reports orders that record sorts cannot express exactly', () => {
    const { steps, inexactlyConvertedSorts } = convert({
      gqlOperationOrderBy: [
        { status: 'AscNullsFirst' },
        { companyId: 'DescNullsLast' },
        { name: { firstName: 'AscNullsLast' } },
        { name: { lastName: 'DescNullsLast' } },
        { salary: { currencyCode: 'AscNullsLast' } },
        { company: { employees: 'DescNullsLast' } },
        { unknownField: 'AscNullsLast' },
      ],
    });

    expect(recordSortsOf(steps)).toEqual([
      expect.objectContaining({ fieldMetadataId: STATUS.id, direction: 'ASC' }),
      expect.objectContaining({
        fieldMetadataId: COMPANY.id,
        direction: 'DESC',
      }),
      expect.objectContaining({
        fieldMetadataId: NAME.id,
        direction: 'ASC',
        subFieldName: 'firstName',
      }),
      expect.objectContaining({ fieldMetadataId: SALARY.id, direction: 'ASC' }),
      expect.objectContaining({
        fieldMetadataId: COMPANY.id,
        direction: 'DESC',
      }),
    ]);
    expect(inexactlyConvertedSorts).toEqual([
      { stepId: 'step-id', orderByEntry: { status: 'AscNullsFirst' } },
      { stepId: 'step-id', orderByEntry: { companyId: 'DescNullsLast' } },
      {
        stepId: 'step-id',
        orderByEntry: { name: { lastName: 'DescNullsLast' } },
      },
      {
        stepId: 'step-id',
        orderByEntry: { salary: { currencyCode: 'AscNullsLast' } },
      },
      {
        stepId: 'step-id',
        orderByEntry: { company: { employees: 'DescNullsLast' } },
      },
      { stepId: 'step-id', orderByEntry: { unknownField: 'AscNullsLast' } },
    ]);
  });

  it('gives record sorts written without an id a stable one', () => {
    const run = () =>
      moveFindRecordsSortsToRecordSorts({
        steps: [
          findRecordsStep({
            recordSorts: [
              { id: 'kept-id', fieldMetadataId: 'name-id', direction: 'ASC' },
              { fieldMetadataId: 'employees-id', direction: 'DESC' },
            ],
          }),
        ],
        fieldsByObjectName,
      });

    const result = run();

    expect(result.hasChanged).toBe(true);
    expect(result.steps).toEqual([
      findRecordsStep({
        recordSorts: [
          { id: 'kept-id', fieldMetadataId: 'name-id', direction: 'ASC' },
          {
            id: expect.any(String),
            fieldMetadataId: 'employees-id',
            direction: 'DESC',
          },
        ],
      }),
    ]);
    expect(run().steps).toEqual(result.steps);
  });

  it('leaves steps without a GraphQL order untouched', () => {
    const steps = [
      findRecordsStep({ recordSorts: [] }),
      { id: 'other', type: 'CREATE_RECORD', settings: { input: {} } },
    ];

    const result = moveFindRecordsSortsToRecordSorts({
      steps,
      fieldsByObjectName,
    });

    expect(result.hasChanged).toBe(false);
    expect(result.steps).toEqual(steps);
  });
});
