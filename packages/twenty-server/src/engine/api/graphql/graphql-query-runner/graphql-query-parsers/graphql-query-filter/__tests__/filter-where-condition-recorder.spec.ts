import { Brackets, NotBrackets } from 'typeorm';

import { FilterWhereConditionRecorder } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-filter/filter-where-condition-recorder';

describe('FilterWhereConditionRecorder', () => {
  it('starts with no recorded condition', () => {
    const recorder = new FilterWhereConditionRecorder();

    expect(recorder.hasWhereCondition).toBe(false);
  });

  it('records a real SQL string predicate', () => {
    const recorder = new FilterWhereConditionRecorder();

    recorder.where('"company"."name" = :name');

    expect(recorder.hasWhereCondition).toBe(true);
  });

  it.each(['', '   ', '\n\t'])(
    'ignores an empty / whitespace-only predicate (%j)',
    (emptyPredicate) => {
      const recorder = new FilterWhereConditionRecorder();

      recorder.where(emptyPredicate);

      expect(recorder.hasWhereCondition).toBe(false);
    },
  );

  it('does not record an empty bracket group', () => {
    const recorder = new FilterWhereConditionRecorder();

    recorder.where(new Brackets(() => {}));

    expect(recorder.hasWhereCondition).toBe(false);
  });

  it('records a predicate nested inside a bracket group', () => {
    const recorder = new FilterWhereConditionRecorder();

    recorder.where(
      new Brackets((qb) => {
        qb.andWhere('"company"."name" = :name');
      }),
    );

    expect(recorder.hasWhereCondition).toBe(true);
  });

  it('records a predicate nested several brackets deep', () => {
    const recorder = new FilterWhereConditionRecorder();

    recorder.where(
      new Brackets((qb) => {
        qb.where(
          new Brackets((innerQb) => {
            innerQb.orWhere('"company"."employees" > :count');
          }),
        );
      }),
    );

    expect(recorder.hasWhereCondition).toBe(true);
  });

  it('does not record an empty NOT bracket group', () => {
    const recorder = new FilterWhereConditionRecorder();

    recorder.where(new NotBrackets(() => {}));

    expect(recorder.hasWhereCondition).toBe(false);
  });

  it('records a predicate wrapped in a NOT bracket group', () => {
    const recorder = new FilterWhereConditionRecorder();

    recorder.where(
      new NotBrackets((qb) => {
        qb.where('"company"."name" = :name');
      }),
    );

    expect(recorder.hasWhereCondition).toBe(true);
  });

  it('keeps relation join bookkeeping as a no-op', () => {
    const recorder = new FilterWhereConditionRecorder();

    recorder.leftJoin();

    expect(recorder.expressionMap.joinAttributes).toHaveLength(0);
    expect(recorder.hasWhereCondition).toBe(false);
  });
});
