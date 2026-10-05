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
