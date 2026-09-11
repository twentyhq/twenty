import { describe, expect, it } from 'vitest';

import { normalizeDocumentationDefaultValue } from '../../../../twenty-ui/docs/normalizeDocumentationDefaultValue';
import { renderComponentReference } from '../render-ui-reference';

describe('documentation defaults', () => {
  it.each([
    ["'onSubmit'", 'onSubmit'],
    ['"horizontal"', 'horizontal'],
    ["'it\\'s ready'", "it's ready"],
    ['"undefined"', 'undefined'],
    ["''", ''],
    ['accent', 'accent'],
    [false, 'false'],
    [0, '0'],
    [null, 'null'],
    [undefined, null],
    ['undefined', null],
  ])('normalizes %j to %j', (value, expected) => {
    expect(normalizeDocumentationDefaultValue({ value })).toBe(expected);
  });

  it('omits absent defaults and renders string defaults without display quotes', () => {
    const reference = renderComponentReference({
      name: 'Example',
      entryPoint: 'twenty-ui/input',
      slug: 'input/example',
      props: [
        {
          name: 'mode',
          type: 'string',
          required: false,
          defaultValue: normalizeDocumentationDefaultValue({
            value: "'onSubmit'",
          }),
          description: '',
        },
        {
          name: 'checked',
          type: 'boolean',
          required: false,
          defaultValue: normalizeDocumentationDefaultValue({
            value: 'undefined',
          }),
          description: '',
        },
      ],
    });

    expect(normalizeDocumentationDefaultValue(null)).toBeNull();
    expect(reference).toContain('default={"onSubmit"}');
    expect(reference.match(/default=/g)).toHaveLength(1);
  });
});
