import { addDefaultConjunctionIfMissing } from 'src/engine/api/rest/api-rest-query-builder/factories/input-factories/filter-utils/add-default-conjunction.utils';

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
