import { describe, expect, it } from 'vitest';
import { resolvePersonTemplateParameters } from 'src/logic-functions/data/resolve-person-template-parameters.util';

const PERSON = {
  name: { firstName: 'Ada', lastName: 'Lovelace' },
  jobTitle: null,
  city: 'London',
  company: { name: 'Analytical Engines' },
};

describe('resolvePersonTemplateParameters', () => {
  it('should fill person fields and keep fixed values', () => {
    expect(
      resolvePersonTemplateParameters({
        parameters: [{ personField: 'fullName' }, { name: 'company', personField: 'companyName' }, { value: 'Monday' }],
        person: PERSON,
      }),
    ).toEqual([{ value: 'Ada Lovelace' }, { name: 'company', value: 'Analytical Engines' }, { value: 'Monday' }]);
  });

  it('should give up when the person lacks a field', () => {
    expect(resolvePersonTemplateParameters({ parameters: [{ personField: 'jobTitle' }], person: PERSON })).toBeUndefined();
  });
});
