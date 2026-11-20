import { describe, expect, it } from 'vitest';
import { buildTemplateParametersFromValues } from 'src/logic-functions/data/build-template-parameters-from-values.util';

describe('buildTemplateParametersFromValues', () => {
  it('should keep placeholder order for positional templates', () => {
    expect(
      buildTemplateParametersFromValues({ keys: ['1', '2'], values: { 2: 'Monday', 1: 'Ada' }, parameterFormat: 'POSITIONAL' }),
    ).toEqual([{ value: 'Ada' }, { value: 'Monday' }]);
  });

  it('should name each value for named templates', () => {
    expect(
      buildTemplateParametersFromValues({ keys: ['first_name'], values: { first_name: 'Ada' }, parameterFormat: 'NAMED' }),
    ).toEqual([{ name: 'first_name', value: 'Ada' }]);
  });
});
