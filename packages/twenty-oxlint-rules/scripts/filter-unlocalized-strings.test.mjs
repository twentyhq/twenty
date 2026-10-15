import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
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
  assert.equal(check('<TextInput error={"required"} />', '"required"'), true);
  assert.equal(
    check('<ImageInput errorMessage="invalid image" />', '"invalid image"'),
    true,
  );
  assert.equal(
    check('<ImageInput helperText="choose an image" />', '"choose an image"'),
    true,
  );
  assert.equal(check('<TextInput hint="optional" />', '"optional"'), true);
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
  assert.equal(
    check("const result = { error: 'timeout' };", "'timeout'"),
    false,
  );
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

test('reports lower-case JSX errors but ignores technical error codes', () => {
  const packageRoot = mkdtempSync(join(tmpdir(), 'lingui-error-prop-'));

  try {
    mkdirSync(join(packageRoot, 'src'));
    writeFileSync(
      join(packageRoot, 'src', 'example.tsx'),
      '<TextInput error="required" />\nconst result = { error: "timeout" };\n',
    );

    const lint = spawnSync(
      process.execPath,
      [
        fileURLToPath(
          new URL('./check-unlocalized-strings.mjs', import.meta.url),
        ),
        packageRoot,
        'src',
      ],
      { encoding: 'utf8' },
    );

    assert.equal(lint.status, 1);
    assert.match(
      lint.stderr,
      /src\/example\.tsx:1: String not marked for translation\./,
    );
    assert.match(lint.stderr, /1 string\(s\) need Lingui translation markers/);
  } finally {
    rmSync(packageRoot, { recursive: true, force: true });
  }
});
