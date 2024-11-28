import { assertUnreachable } from '@/workflow/utils/assertUnreachable';

it('throws when argument is not never', () => {
  expect(() => {
    assertUnreachable(42 as never);
  }).toThrow();
});

it('throws with the provided error message when argument is not never', () => {
  expect(() => {
    assertUnreachable(42 as never, 'Custom error!');
  }).toThrow('Custom error!');
});
