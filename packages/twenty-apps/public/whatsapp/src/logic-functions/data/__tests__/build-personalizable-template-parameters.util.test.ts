import { describe, expect, it } from 'vitest';
import { buildPersonalizableTemplateParameters } from 'src/logic-functions/data/build-personalizable-template-parameters.util';

describe('buildPersonalizableTemplateParameters', () => {
  it('should keep placeholder order and mix fixed values with person fields', () => {
    expect(
      buildPersonalizableTemplateParameters({
        keys: ['1', '2'],
        values: { 2: ' Monday ' },
        personFields: { 1: 'firstName' },
        parameterFormat: 'POSITIONAL',
      }),
    ).toEqual([{ personField: 'firstName' }, { value: 'Monday' }]);
  });

  it('should name each parameter for named templates', () => {
    expect(
      buildPersonalizableTemplateParameters({
        keys: ['company'],
        values: {},
        personFields: { company: 'companyName' },
        parameterFormat: 'NAMED',
      }),
    ).toEqual([{ name: 'company', personField: 'companyName' }]);
  });
});
