import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const entrypoint = fileURLToPath(new URL('../entrypoint.sh', import.meta.url));

const runEntrypoint = (environment = {}) => {
  const directory = mkdtempSync(join(tmpdir(), 'twenty-entrypoint-'));
  const callsPath = join(directory, 'calls');

  try {
    writeFileSync(callsPath, '');
    writeFileSync(join(directory, 'psql'), '#!/bin/sh\necho t\n', {
      mode: 0o755,
    });
    writeFileSync(
      join(directory, 'yarn'),
      `#!/bin/sh
echo "$*" >> "$CALLS_PATH"
case "$*" in
  "command:prod upgrade") exit "$UPGRADE_EXIT_CODE" ;;
  "command:prod cache:flush") exit "$FLUSH_EXIT_CODE" ;;
esac
`,
      { mode: 0o755 },
    );
    writeFileSync(
      join(directory, 'application'),
      '#!/bin/sh\necho application >> "$CALLS_PATH"\n',
      { mode: 0o755 },
    );

    const result = spawnSync('/bin/sh', [entrypoint, 'application'], {
      encoding: 'utf8',
      env: {
        PATH: `${directory}:/usr/bin:/bin`,
        CALLS_PATH: callsPath,
        UPGRADE_EXIT_CODE: '0',
        FLUSH_EXIT_CODE: '0',
        ...environment,
      },
    });

    assert.ifError(result.error);

    return {
      ...result,
      calls: readFileSync(callsPath, 'utf8').trim().split('\n'),
    };
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
};

test('failed upgrades stop startup before jobs or the application run', () => {
  const result = runEntrypoint({ UPGRADE_EXIT_CODE: '1' });

  assert.equal(result.status, 1);
  assert.deepEqual(result.calls, [
    'command:prod cache:flush',
    'command:prod upgrade',
  ]);
  assert.match(result.stderr, /Upgrade failed/);
  assert.doesNotMatch(result.stdout, /Successfully migrated DB/);
});

test('successful upgrades flush caches before starting jobs and the application', () => {
  const result = runEntrypoint();

  assert.equal(result.status, 0);
  assert.deepEqual(result.calls, [
    'command:prod cache:flush',
    'command:prod upgrade',
    'command:prod cache:flush',
    'command:prod cron:register:all',
    'application',
  ]);
});

test('cache flush failures still allow a successful upgrade to start', () => {
  const result = runEntrypoint({ FLUSH_EXIT_CODE: '1' });

  assert.equal(result.status, 0);
  assert.equal(result.calls.at(-1), 'application');
  assert.match(result.stdout, /Failed to flush cache after upgrade/);
});

test('disabled migrations and cron registration allow diagnostic commands to run', () => {
  const result = runEntrypoint({
    DISABLE_DB_MIGRATIONS: 'true',
    DISABLE_CRON_JOBS_REGISTRATION: 'true',
    UPGRADE_EXIT_CODE: '1',
  });

  assert.equal(result.status, 0);
  assert.deepEqual(result.calls, ['application']);
});
