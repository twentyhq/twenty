import { isStandaloneVariableString } from '@/workflow/utils/isStandaloneVariableString';

it('returns false if the provided value is not a string', () => {
  expect(isStandaloneVariableString(42)).toBe(false);
});

it('returns true if the provided value is a valid variable definition string', () => {
  expect(isStandaloneVariableString('{{ test.a.b.c }}')).toBe(true);
});

it('returns false if the provided value starts with blank spaces', () => {
  expect(isStandaloneVariableString(' {{ test.a.b.c }}')).toBe(false);
});

it('returns false if the provided value ends with blank spaces', () => {
  expect(isStandaloneVariableString('{{ test.a.b.c }} ')).toBe(false);
});
