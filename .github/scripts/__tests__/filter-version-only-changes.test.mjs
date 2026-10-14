import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import {
  chmodSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, beforeEach, test } from 'node:test';
import { fileURLToPath } from 'node:url';

const SCRIPT_PATH = fileURLToPath(
  new URL('../filter-version-only-changes.mjs', import.meta.url),
);
const PACKAGE_PATH = 'packages/example/package.json';
const MANIFEST = {
  name: 'example',
  version: '1.0.0',
  dependencies: { dependency: '^1.0.0' },
  scripts: { test: 'node --test' },
};

let directory;
let baseSha;

const git = (...arguments_) =>
  execFileSync('git', arguments_, {
    cwd: directory,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();

const write = (file, contents) => {
  const path = join(directory, file);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, contents);
};

const writeManifest = (manifest, file = PACKAGE_PATH) =>
  write(file, JSON.stringify(manifest, null, 2));

const commit = () => {
  git('add', '.');
  git(
    '-c',
    'user.name=CI Test',
    '-c',
    'user.email=ci-test@example.com',
    '-c',
    'core.hooksPath=/dev/null',
    'commit',
    '--quiet',
    '--allow-empty',
    '-m',
    'Test fixture',
  );

  return git('rev-parse', 'HEAD');
};

const check = ({
  changedFiles = [PACKAGE_PATH],
  modifiedFiles = changedFiles,
  environment = {},
} = {}) => {
  const outputPath = join(directory, 'github-output');

  execFileSync(process.execPath, [SCRIPT_PATH], {
    cwd: directory,
    env: {
      ...process.env,
      ANY_CHANGED: 'true',
      CHANGED_FILES: JSON.stringify(changedFiles),
      MODIFIED_FILES: JSON.stringify(modifiedFiles),
      BASE_SHA: baseSha,
      HEAD_SHA: git('rev-parse', 'HEAD'),
      IS_PULL_REQUEST: 'true',
      ...environment,
      GITHUB_OUTPUT: outputPath,
    },
    stdio: 'pipe',
  });

  return readFileSync(outputPath, 'utf8').trim();
};

beforeEach(() => {
  directory = mkdtempSync(join(tmpdir(), 'version-only-ci-'));
  git('init', '--quiet', '--initial-branch=main');
  writeManifest(MANIFEST);
  baseSha = commit();
});

afterEach(() => rmSync(directory, { recursive: true, force: true }));

test('skips version-only bumps across root and workspace manifests', () => {
  writeManifest(MANIFEST, 'package.json');
  baseSha = commit();
  writeManifest({ ...MANIFEST, version: '2.0.0' });
  write('package.json', JSON.stringify({ ...MANIFEST, version: '2.0.0' }));
  commit();

  assert.equal(
    check({ changedFiles: ['package.json', PACKAGE_PATH] }),
    'any_changed=false',
  );
});

for (const [field, value] of Object.entries({
  dependencies: { dependency: '^2.0.0' },
  scripts: { test: 'node another-test.mjs' },
  exports: { '.': './new-entry.mjs' },
  description: 'Changed description',
})) {
  test(`keeps CI for a version bump combined with ${field} changes`, () => {
    writeManifest({ ...MANIFEST, version: '2.0.0', [field]: value });
    commit();

    assert.equal(check(), 'any_changed=true');
  });
}

for (const file of ['yarn.lock', 'packages/example/index.js']) {
  test(`keeps CI when a version bump accompanies ${file}`, () => {
    writeManifest({ ...MANIFEST, version: '2.0.0' });
    write(file, 'changed');
    commit();

    assert.equal(
      check({ changedFiles: [PACKAGE_PATH, file] }),
      'any_changed=true',
    );
  });
}

test('keeps CI when a package is renamed', () => {
  const movedPath = 'packages/moved/package.json';
  mkdirSync(dirname(join(directory, movedPath)), { recursive: true });
  renameSync(join(directory, PACKAGE_PATH), join(directory, movedPath));
  writeManifest({ ...MANIFEST, version: '2.0.0' }, movedPath);
  commit();

  assert.equal(
    check({ changedFiles: [movedPath], modifiedFiles: [] }),
    'any_changed=true',
  );
});

test('keeps CI when a package is added', () => {
  const addedPath = 'packages/added/package.json';
  writeManifest({ ...MANIFEST, version: '2.0.0' }, addedPath);
  commit();

  assert.equal(
    check({ changedFiles: [addedPath], modifiedFiles: [] }),
    'any_changed=true',
  );
});

test('keeps CI when a package is deleted alongside a version bump', () => {
  writeManifest(MANIFEST, 'package.json');
  baseSha = commit();
  writeManifest({ ...MANIFEST, version: '2.0.0' }, 'package.json');
  rmSync(join(directory, PACKAGE_PATH));
  commit();

  assert.equal(
    check({
      changedFiles: ['package.json', PACKAGE_PATH],
      modifiedFiles: ['package.json'],
    }),
    'any_changed=true',
  );
});

test('keeps CI when only a package is deleted', () => {
  rmSync(join(directory, PACKAGE_PATH));
  commit();

  assert.equal(check({ modifiedFiles: [] }), 'any_changed=true');
});

test('keeps CI when conditional export order changes', () => {
  writeManifest({
    ...MANIFEST,
    exports: { node: './node.js', default: './index.js' },
  });
  baseSha = commit();
  writeManifest({
    ...MANIFEST,
    version: '2.0.0',
    exports: { default: './index.js', node: './node.js' },
  });
  commit();

  assert.equal(check(), 'any_changed=true');
});

test('keeps CI for a version bump combined with file mode changes', () => {
  writeManifest({ ...MANIFEST, version: '2.0.0' });
  chmodSync(join(directory, PACKAGE_PATH), 0o755);
  git('update-index', '--chmod=+x', PACKAGE_PATH);
  commit();

  assert.equal(check(), 'any_changed=true');
});

for (const version of [undefined, null, '', 2]) {
  test(`keeps CI for a removed or non-string version: ${version}`, () => {
    writeManifest({ ...MANIFEST, version });
    commit();

    assert.equal(check(), 'any_changed=true');
  });
}

test('keeps CI when a manifest cannot be parsed', () => {
  write(PACKAGE_PATH, '{');
  commit();

  assert.equal(check(), 'any_changed=true');
});

test('keeps CI when comparison history is unavailable', () => {
  writeManifest({ ...MANIFEST, version: '2.0.0' });
  commit();

  assert.equal(
    check({ environment: { BASE_SHA: 'missing-commit' } }),
    'any_changed=true',
  );
});

test('compares the complete PR, not only its latest version-bump commit', () => {
  writeManifest({ ...MANIFEST, dependencies: { dependency: '^2.0.0' } });
  commit();
  writeManifest({
    ...MANIFEST,
    version: '2.0.0',
    dependencies: { dependency: '^2.0.0' },
  });
  commit();

  assert.equal(check(), 'any_changed=true');
});

test('uses the PR merge base when the target branch has advanced', () => {
  git('checkout', '-b', 'feature');
  writeManifest({ ...MANIFEST, version: '2.0.0' });
  const headSha = commit();
  git('checkout', 'main');
  writeManifest({ ...MANIFEST, dependencies: { dependency: '^2.0.0' } });
  baseSha = commit();

  assert.equal(
    check({ environment: { HEAD_SHA: headSha } }),
    'any_changed=false',
  );
});

test('supports push comparisons using the previous commit', () => {
  writeManifest({ ...MANIFEST, version: '2.0.0' });
  commit();

  assert.equal(
    check({ environment: { IS_PULL_REQUEST: 'false' } }),
    'any_changed=false',
  );
});

test('preserves a caller with no matching changed files', () => {
  assert.equal(
    check({ changedFiles: [], environment: { ANY_CHANGED: 'false' } }),
    'any_changed=false',
  );
});
