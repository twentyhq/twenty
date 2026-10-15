import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createStringDiagnosticFilter } from './filter-unlocalized-strings.mjs';

const check = (source, value, filename = 'example.tsx') => {
  const sourceBuffer = Buffer.from(source);
  const offset = Buffer.byteLength(source.slice(0, source.indexOf(value)));

  return createStringDiagnosticFilter({ filename, sourceBuffer })({
    offset,
    length: Buffer.byteLength(value),
  });
};

test('checks one-word JSX text and visible attributes', () => {
  assert.equal(check('<div>cancel</div>', 'cancel'), true);
  assert.equal(check('<div>{"cancel"}</div>', '"cancel"'), true);
  assert.equal(check('<Button label="cancel" />', '"cancel"'), true);
  assert.equal(check('<Button label="CANCEL" />', '"CANCEL"'), true);
  assert.equal(check('<Button label={`cancel`} />', '`cancel`'), true);
  assert.equal(
    check('<Button label={active ? "cancel" : "save"} />', '"cancel"'),
    true,
  );
  assert.equal(check('<input placeholder="cancel" />', '"cancel"'), true);
  assert.equal(
    check('<input placeholder="yourdomain.com" />', '"yourdomain.com"'),
    false,
  );
});

test('checks visible object labels without flagging technical values', () => {
  assert.equal(check("const item = { label: 'cancel' };", "'cancel'"), true);
  assert.equal(check('<Button side="top" />', '"top"'), false);
  assert.equal(check("const item = { side: 'top' };", "'top'"), false);
  assert.equal(check("const value = 'cancel';", "'cancel'"), false);
});

test('preserves diagnostics that the old case patterns did not ignore', () => {
  assert.equal(
    check("const value = 'Unlocalized message';", "'Unlocalized message'"),
    true,
  );
  assert.equal(
    check('// é\nconst item = { label: "cancel" };', '"cancel"'),
    true,
  );
});
