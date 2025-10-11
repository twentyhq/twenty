import { checkFilterQuery } from 'src/engine/api/rest/input-request-parsers/filter-parser-utils/check-filter-query.util';

describe('checkFilterQuery', () => {
  it('should check filter query', () => {
    expect(() => checkFilterQuery('(')).toThrow(
      "'filter' invalid. 1 close bracket is missing in the query",
    );

    expect(() => checkFilterQuery(')')).toThrow(
      "'filter' invalid. 1 open bracket is missing in the query",
    );

    expect(() => checkFilterQuery('(()')).toThrow(
      "'filter' invalid. 1 close bracket is missing in the query",
    );

    expect(() => checkFilterQuery('()))')).toThrow(
      "'filter' invalid. 2 open brackets are missing in the query",
    );

    expect(() =>
      checkFilterQuery(
        'and(or(fieldNumber[eq]:1,fieldNumber[eq]:2)),fieldNumber[eq]:3)',
      ),
    ).toThrow("'filter' invalid. 1 open bracket is missing in the query");

    expect(() =>
      checkFilterQuery(
        'and(or(fieldNumber[eq]:1,fieldNumber[eq]:2),fieldNumber[eq]:3)',
      ),
    ).not.toThrow();
  });
});
