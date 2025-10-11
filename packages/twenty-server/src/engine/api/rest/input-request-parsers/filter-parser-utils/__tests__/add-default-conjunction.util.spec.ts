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
});
