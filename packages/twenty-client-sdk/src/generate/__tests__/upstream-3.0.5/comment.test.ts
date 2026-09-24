import { expect, test } from 'vitest';

import { comment } from '../../genql/render/common/comment';

// Port of remorses/genql@v3.0.5
// cli/src/render/common/__tests__/comment.test.ts, with common-tags'
// stripIndent replaced by explicit expected strings.
test('deprecated', () => {
  expect(comment({ deprecated: 'deprecation reason' })).toBe(
    '\n/** @deprecated deprecation reason */\n',
  );
});

test('deprecated multiline', () => {
  expect(comment({ deprecated: 'deprecation\nreason\nmultiline' })).toBe(
    '\n/** @deprecated deprecation reason multiline */\n',
  );
});

test('single line', () => {
  expect(comment({ text: 'single line' })).toBe('\n/** single line */\n');
});

test('single line deprecated', () => {
  expect(
    comment({ text: 'single line', deprecated: 'deprecation reason' }),
  ).toBe('\n/**\n * @deprecated deprecation reason\n * single line\n */\n');
});

test('multiline', () => {
  expect(comment({ text: 'multiline\ntext' })).toBe(
    '\n/**\n * multiline\n * text\n */\n',
  );
});

test('multiline deprecated', () => {
  expect(
    comment({ text: 'multiline\ntext', deprecated: 'deprecation reason' }),
  ).toBe(
    '\n/**\n * @deprecated deprecation reason\n * multiline\n * text\n */\n',
  );
});
