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

  it('should add default conjunction when a bare filter is mixed with a nested conjunction', () => {
    expect(
      addDefaultConjunctionIfMissing(
        "status[eq]:'TODO',and(title[ilike]:'%test%')",
      ),
    ).toEqual("and(status[eq]:'TODO',and(title[ilike]:'%test%'))");
  });

  it('should not add default conjunction for root or conjunction', () => {
    expect(addDefaultConjunctionIfMissing('or(field[eq]:1)')).toEqual(
      'or(field[eq]:1)',
    );
  });

  it('should not add default conjunction for root not conjunction', () => {
    expect(addDefaultConjunctionIfMissing('not(field[eq]:1)')).toEqual(
      'not(field[eq]:1)',
    );
  });

  it('should add default conjunction when several conjunctions are at the root', () => {
    expect(
      addDefaultConjunctionIfMissing(
        'or(city[eq]:"Paris",city[eq]:"Lyon"),not(name[eq]:"Bob")',
      ),
    ).toEqual('and(or(city[eq]:"Paris",city[eq]:"Lyon"),not(name[eq]:"Bob"))');
  });

  it('should not add default conjunction when a quoted value contains parentheses', () => {
    expect(addDefaultConjunctionIfMissing('or(name[eq]:"Acme (EU)")')).toEqual(
      'or(name[eq]:"Acme (EU)")',
    );
  });

  it('should add default conjunction when quoted parentheses would hide sibling groups', () => {
    expect(
      addDefaultConjunctionIfMissing('or(a[eq]:"("),not(b[eq]:")")'),
    ).toEqual('and(or(a[eq]:"("),not(b[eq]:")"))');
  });
});
