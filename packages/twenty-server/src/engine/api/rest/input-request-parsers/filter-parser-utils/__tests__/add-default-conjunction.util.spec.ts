import { addDefaultConjunctionIfMissing } from 'src/engine/api/rest/input-request-parsers/filter-parser-utils/add-default-conjunction.util';

describe('addDefaultConjunctionIfMissing', () => {
  it('should add default conjunction if missing', () => {
    expect(addDefaultConjunctionIfMissing('field[eq]:1')).toEqual(
      'and(field[eq]:1)',
    );
  });

  it('should not add default conjunction if not missing', () => {
    expect(addDefaultConjunctionIfMissing('and(field[eq]:1)')).toEqual(
      'and(field[eq]:1)',
    );
  });

  it('should add default conjunction when bare filters are mixed with nested conjunctions', () => {
    expect(
      addDefaultConjunctionIfMissing(
        "status[eq]:'TODO',and(title[ilike]:'%test%')",
      ),
    ).toEqual("and(status[eq]:'TODO',and(title[ilike]:'%test%'))");
  });

  it('should add default conjunction for multiple bare filters with nested or', () => {
    expect(
      addDefaultConjunctionIfMissing(
        "field1[in]:['a','b'],or(field2[like]:'%x%')",
      ),
    ).toEqual("and(field1[in]:['a','b'],or(field2[like]:'%x%'))");
  });

  it('should not add default conjunction for or root conjunction', () => {
    expect(
      addDefaultConjunctionIfMissing('or(field[eq]:1,field[eq]:2)'),
    ).toEqual('or(field[eq]:1,field[eq]:2)');
  });

  it('should not add default conjunction for not root conjunction', () => {
    expect(addDefaultConjunctionIfMissing('not(field[eq]:1)')).toEqual(
      'not(field[eq]:1)',
    );
  });

  it('should add default conjunction for multiple bare filters', () => {
    expect(
      addDefaultConjunctionIfMissing('field1[eq]:1,field2[gte]:10'),
    ).toEqual('and(field1[eq]:1,field2[gte]:10)');
  });
});
