import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { appendServerVariablesToAppConfig } from '@/cli/utilities/file/append-server-variables.util';

const VARIABLES = [
  {
    name: 'LINEAR_CLIENT_ID',
    description: 'OAuth client ID from Linear.',
    isSecret: false,
  },
  {
    name: 'LINEAR_CLIENT_SECRET',
    description: 'OAuth client secret from Linear.',
    isSecret: true,
  },
];

describe('appendServerVariablesToAppConfig', () => {
  let projectRoot: string;
  let configPath: string;

  beforeEach(async () => {
    projectRoot = await mkdtemp(join(tmpdir(), 'twenty-cli-spec-'));
    await mkdir(join(projectRoot, 'src'), { recursive: true });
    configPath = join(projectRoot, 'src/application.config.ts');
  });

  afterEach(async () => {
    // Tests get fresh tmpdirs; OS handles cleanup. Keeping the dirs around
    // helps debug failures.
  });

  it('appends entries inside an existing serverVariables block', async () => {
    await writeFile(
      configPath,
      `import { defineApplication } from 'twenty-sdk/define';

export default defineApplication({
  universalIdentifier: '...',
  serverVariables: {
    EXISTING_VAR: { description: '...', isSecret: false, isRequired: true },
  },
});
`,
      'utf8',
    );

    const result = await appendServerVariablesToAppConfig({
      projectRoot,
      variables: VARIABLES,
    });

    expect(result).toEqual({ status: 'appended', file: configPath });

    const updated = await readFile(configPath, 'utf8');

    expect(updated).toContain('LINEAR_CLIENT_ID');
    expect(updated).toContain('LINEAR_CLIENT_SECRET');
    // Existing entry survives.
    expect(updated).toContain('EXISTING_VAR');
    // New entries land inside the existing block, not in a new one.
    expect(updated.match(/serverVariables\s*:\s*\{/g)?.length).toBe(1);
  });

  it('creates a fresh serverVariables block when none exists', async () => {
    await writeFile(
      configPath,
      `import { defineApplication } from 'twenty-sdk/define';

export default defineApplication({
  universalIdentifier: '...',
  displayName: 'My App',
});
`,
      'utf8',
    );

    const result = await appendServerVariablesToAppConfig({
      projectRoot,
      variables: VARIABLES,
    });

    expect(result).toEqual({ status: 'created', file: configPath });

    const updated = await readFile(configPath, 'utf8');

    expect(updated).toContain('serverVariables: {');
    expect(updated).toContain('LINEAR_CLIENT_ID');
    expect(updated).toContain('LINEAR_CLIENT_SECRET');
    // The defineApplication() closing should still be there.
    expect(updated).toMatch(/\}\)\s*;?\s*$/);
  });

  it('skips variables that are already declared (idempotent re-runs)', async () => {
    await writeFile(
      configPath,
      `import { defineApplication } from 'twenty-sdk/define';

export default defineApplication({
  serverVariables: {
    LINEAR_CLIENT_ID: { description: '...', isSecret: false, isRequired: true },
    LINEAR_CLIENT_SECRET: { description: '...', isSecret: true, isRequired: true },
  },
});
`,
      'utf8',
    );

    const result = await appendServerVariablesToAppConfig({
      projectRoot,
      variables: VARIABLES,
    });

    expect(result).toEqual({ status: 'skipped-existing' });
  });

  it('returns skipped-no-config when no application.config.ts exists', async () => {
    const result = await appendServerVariablesToAppConfig({
      projectRoot,
      variables: VARIABLES,
    });

    expect(result).toEqual({ status: 'skipped-no-config' });
  });

  it('finds the alternative application-config.ts filename', async () => {
    const altPath = join(projectRoot, 'src/application-config.ts');

    await writeFile(
      altPath,
      `import { defineApplication } from 'twenty-sdk/define';

export default defineApplication({
  universalIdentifier: '...',
});
`,
      'utf8',
    );

    const result = await appendServerVariablesToAppConfig({
      projectRoot,
      variables: VARIABLES,
    });

    expect(result).toEqual({ status: 'created', file: altPath });
  });

  it('returns skipped-no-app-call when the file lacks defineApplication', async () => {
    await writeFile(
      configPath,
      `// not an app config\nexport const FOO = 1;\n`,
      'utf8',
    );

    const result = await appendServerVariablesToAppConfig({
      projectRoot,
      variables: VARIABLES,
    });

    expect(result).toEqual({ status: 'skipped-no-app-call' });
  });
});
