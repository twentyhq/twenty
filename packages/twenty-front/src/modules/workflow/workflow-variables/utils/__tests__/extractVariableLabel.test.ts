import { extractVariableLabel } from '../extractVariableLabel';

it('returns the last part of a properly formatted variable', () => {
  const rawVariable = '{{a.b.c}}';

  expect(extractVariableLabel(rawVariable)).toBe('c');
});

it('stops on unclosed variables', () => {
  const rawVariable = '{{ test {{a.b.c}}';

  expect(extractVariableLabel(rawVariable)).toBe('c');
});
