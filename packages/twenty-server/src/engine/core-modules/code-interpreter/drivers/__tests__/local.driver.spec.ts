import {
  CODE_INTERPRETER_MAX_OUTPUT_FILE_COUNT,
  CODE_INTERPRETER_MAX_OUTPUT_LENGTH,
} from 'src/engine/core-modules/code-interpreter/code-interpreter.constants';
import { LocalDriver } from 'src/engine/core-modules/code-interpreter/drivers/local.driver';

describe('Local code interpreter participant isolation', () => {
  const driver = new LocalDriver({ timeoutMs: 5000 });
  const sessionId = 'shared-conversation';

  afterEach(async () => {
    await driver.releaseSession(sessionId);
  });

  it('preserves a participant’s state, then discards variables, files and credentials when the sender changes', async () => {
    const first = {
      sessionId,
      actorKey: 'alice:direct',
      env: { PRIVATE_TOKEN: 'alice-token' },
    };
    const created = await driver.execute(
      "secret = 'alice-private'\nopen('private.txt', 'w').write(secret)",
      [],
      first,
    );
    expect(created.exitCode).toBe(0);
    const reused = await driver.execute(
      "print(secret)\nprint(open('private.txt').read())",
      [],
      first,
    );
    expect(reused.stdout).toBe('alice-private\nalice-private\n');

    const switched = await driver.execute(
      "import os\nprint('secret' in globals())\nprint(os.path.exists('private.txt'))\nprint(os.environ.get('PRIVATE_TOKEN', 'absent'))",
      [],
      { sessionId, actorKey: 'bob:direct' },
    );
    expect(switched.exitCode).toBe(0);
    expect(switched.stdout).toBe('False\nFalse\nabsent\n');
  });

  it('also discards state when the same sender changes application context', async () => {
    await driver.execute("secret = 'direct-context'", [], {
      sessionId,
      actorKey: 'alice:direct',
    });
    const restricted = await driver.execute(
      "print('secret' in globals())",
      [],
      { sessionId, actorKey: 'alice:application' },
    );
    expect(restricted.exitCode).toBe(0);
    expect(restricted.stdout).toBe('False\n');
    const next = await driver.execute("print('still-running')", [], {
      sessionId,
      actorKey: 'alice:application',
    });
    expect(next.stdout).toBe('still-running\n');
  });
});

describe('Local code interpreter output files', () => {
  const driver = new LocalDriver({ timeoutMs: 5000 });

  it('skips oversized files and stops at the file count limit', async () => {
    const result = await driver.execute(
      "open('/home/user/output/big.bin', 'wb').truncate(30 * 1024 * 1024)\nfor index in range(25):\n    open(f'/home/user/output/file-{index}.txt', 'w').write('ok')",
      [],
    );

    expect(result.exitCode).toBe(0);
    expect(result.files).toHaveLength(CODE_INTERPRETER_MAX_OUTPUT_FILE_COUNT);
    expect(result.files.map((file) => file.filename)).not.toContain('big.bin');
  });

  it('truncates stdout past the output length limit', async () => {
    const result = await driver.execute(
      "for index in range(5000):\n    print('x' * 99)",
      [],
    );

    expect(result.exitCode).toBe(0);
    expect(result.stdout.startsWith('x'.repeat(99))).toBe(true);
    expect(result.stdout.endsWith('[output truncated]')).toBe(true);
    expect(result.stdout.length).toBeLessThan(
      CODE_INTERPRETER_MAX_OUTPUT_LENGTH + 100,
    );
  });
});
