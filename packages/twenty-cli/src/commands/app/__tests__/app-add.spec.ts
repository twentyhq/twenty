import {
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { getFieldUniversalIdentifier } from 'twenty-shared/application';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  parseSingleJsonLine,
  runCliForTest,
} from '@/__tests__/utils/run-cli-for-test';
import { createStandardInputStub } from '@/__tests__/utils/create-standard-input-stub';
import { promptForAppAddValue } from '@/app/add/prompt-for-app-add-value';
import { readAppIdentity } from '@/app/read-app-identity';
import { confirmInTerminal } from '@/input/confirm-in-terminal';
import { CliError } from '@/output/cli-error';

vi.mock('@/app/read-app-identity', () => ({ readAppIdentity: vi.fn() }));
vi.mock('@/app/add/prompt-for-app-add-value', () => ({
  promptForAppAddValue: vi.fn(),
}));

vi.mock('@/input/confirm-in-terminal', () => ({ confirmInTerminal: vi.fn() }));

const OBJECT_IDENTIFIER = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

describe('app add', () => {
  let root: string;
  let appPath: string;
  const run = (args: string[]) => runCliForTest(['app', 'add', ...args]);
  const runJson = async (args: string[]) => {
    const result = await run([...args, '--json']);

    return { ...result, envelope: parseSingleJsonLine(result.stdout) };
  };

  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), 'twenty-app-add-'));
    appPath = join(root, 'app');
    await mkdir(appPath);
    await writeFile(
      join(appPath, 'package.json'),
      JSON.stringify({
        name: 'test-app',
        dependencies: { 'twenty-sdk': '2.44.0' },
      }),
    );
    vi.spyOn(process, 'cwd').mockReturnValue(appPath);
    vi.mocked(readAppIdentity).mockResolvedValue({
      application: {
        universalIdentifier: OBJECT_IDENTIFIER,
        displayName: 'App',
      },
      diagnostics: [],
    });
    vi.mocked(promptForAppAddValue).mockReset();
    vi.mocked(confirmInTerminal).mockReset().mockResolvedValue(false);
  });

  afterEach(async () => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    await rm(root, { recursive: true, force: true });
  });

  it.each([
    {
      entity: 'object',
      name: 'invoice',
      options: ['--name-plural', 'invoices'],
      path: 'src/objects/invoice.ts',
      define: 'defineObject',
    },
    {
      entity: 'field',
      name: 'amount',
      options: ['--type', 'NUMBER', '--object', OBJECT_IDENTIFIER],
      path: 'src/fields/amount.ts',
      define: 'defineField',
    },
    {
      entity: 'logic-function',
      name: 'SendInvoice',
      options: [],
      path: 'src/logic-functions/send-invoice.ts',
      define: 'defineLogicFunction',
    },
    {
      entity: 'front-component',
      name: 'InvoicePanel',
      options: [],
      path: 'src/front-components/invoice-panel.tsx',
      define: 'defineFrontComponent',
    },
  ])(
    'creates a standalone $entity definition with app-relative JSON paths',
    async ({ entity, name, options, path, define }) => {
      const result = await runJson([entity, '--name', name, ...options]);

      expect(result.exitCode, result.stdout).toBe(0);
      expect(result.envelope.data).toEqual({
        app: { name: 'test-app', path: appPath },
        entity,
        name,
        createdPaths: [path],
        diagnostics: [],
      });
      const content = await readFile(join(appPath, path), 'utf8');

      expect(content).toContain(`export default ${define}({`);
      expect(content).toMatch(
        /universalIdentifier: '[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}'/,
      );
      expect(await readdir(join(appPath, 'src'), { recursive: true })).toEqual(
        expect.arrayContaining([path.slice(4)]),
      );
      expect(vi.mocked(promptForAppAddValue)).not.toHaveBeenCalled();
    },
  );

  it.each([
    [true, false, false],
    [false, true, false],
    [false, false, true],
    [true, true, false],
    [true, false, true],
    [false, true, true],
    [true, true, true],
  ])(
    'creates selected companions, view=%s navigation=%s layout=%s',
    async (createView, createNavigation, createLayout) => {
      const paths = [
        'src/objects/invoice.ts',
        ...(createView ? ['src/views/all-invoice.ts'] : []),
        ...(createNavigation ? ['src/navigation-menu-items/invoice.ts'] : []),
        ...(createLayout
          ? [
              'src/views/invoice-record-page-fields.ts',
              'src/page-layouts/invoice-record-page-layout.ts',
            ]
          : []),
      ];
      const result = await runJson([
        'object',
        '--name',
        'invoice',
        '--name-plural',
        'invoices',
        ...(createView ? ['--create-view'] : []),
        ...(createNavigation ? ['--create-navigation-menu-item'] : []),
        ...(createLayout ? ['--create-page-layout'] : []),
      ]);

      expect(result.exitCode, result.stdout).toBe(0);
      expect(result.envelope.data).toMatchObject({ createdPaths: paths });
      const object = await readFile(join(appPath, paths[0]), 'utf8');
      const objectIdentifier = object.match(
        /universalIdentifier: '([^']+)'/,
      )![1];
      const nameFieldIdentifier = object.match(
        /NAME_FIELD_UNIVERSAL_IDENTIFIER =\s*'([^']+)'/,
      )![1];

      for (const path of paths.slice(1)) {
        const content = await readFile(join(appPath, path), 'utf8');
        expect(content).toContain(objectIdentifier);
        if (path.startsWith('src/views/'))
          expect(content).toContain(nameFieldIdentifier);
      }
      if (createLayout) {
        const fieldsView = await readFile(
          join(appPath, 'src/views/invoice-record-page-fields.ts'),
          'utf8',
        );
        const fieldsViewIdentifier = fieldsView.match(
          /universalIdentifier: '([^']+)'/,
        )![1];
        const layout = await readFile(
          join(appPath, 'src/page-layouts/invoice-record-page-layout.ts'),
          'utf8',
        );
        expect(layout).toContain(
          `viewUniversalIdentifier: '${fieldsViewIdentifier}'`,
        );
        expect(fieldsView).toContain("type: 'FIELDS_WIDGET'");
        for (const name of [
          'createdAt',
          'updatedAt',
          'createdBy',
          'updatedBy',
        ]) {
          expect(fieldsView).toContain(
            getFieldUniversalIdentifier({
              applicationUniversalIdentifier: OBJECT_IDENTIFIER,
              objectUniversalIdentifier: objectIdentifier,
              name,
            }),
          );
        }
      }
      expect(promptForAppAddValue).not.toHaveBeenCalled();
    },
  );

  it('refuses a companion collision before creating the object or any other definition', async () => {
    await mkdir(join(appPath, 'src/page-layouts'), { recursive: true });
    const path = join(
      appPath,
      'src/page-layouts/invoice-record-page-layout.ts',
    );
    await writeFile(path, 'existing layout');
    const result = await runJson([
      'object',
      '--name',
      'invoice',
      '--name-plural',
      'invoices',
      '--create-view',
      '--create-page-layout',
    ]);

    expect(result.exitCode).toBe(6);
    expect(await readFile(path, 'utf8')).toBe('existing layout');
    expect(await readdir(join(appPath, 'src'), { recursive: true })).toEqual([
      'page-layouts',
      'page-layouts/invoice-record-page-layout.ts',
    ]);
  });

  it('refuses a symlinked companion directory before creating the object', async () => {
    const outside = join(root, 'outside');
    await mkdir(outside);
    await mkdir(join(appPath, 'src'));
    await symlink(outside, join(appPath, 'src/views'));
    const result = await runJson([
      'object',
      '--name',
      'invoice',
      '--name-plural',
      'invoices',
      '--create-view',
    ]);

    expect(result.exitCode).toBe(6);
    expect(await readdir(outside)).toEqual([]);
    expect(await readdir(join(appPath, 'src'))).toEqual(['views']);
  });

  it.each([
    '--create-view',
    '--create-navigation-menu-item',
    '--create-page-layout',
  ])('rejects %s for non-object definitions before writing', async (flag) => {
    const result = await runJson([
      'logic-function',
      '--name',
      'send-invoice',
      flag,
    ]);
    expect(result.exitCode).toBe(2);
    expect(result.envelope.error.message).toContain(flag);
    expect(await readdir(appPath)).toEqual(['package.json']);
  });

  it('uses the containing app from a nested folder and honors --path from outside it', async () => {
    const nestedPath = join(appPath, 'src', 'nested');

    await mkdir(nestedPath, { recursive: true });
    vi.spyOn(process, 'cwd').mockReturnValue(nestedPath);
    expect(
      (await runJson(['logic-function', '--name', 'first'])).exitCode,
    ).toBe(0);
    vi.spyOn(process, 'cwd').mockReturnValue(root);
    expect(
      (await runJson(['logic-function', '--name', 'second', '--path', 'app']))
        .exitCode,
    ).toBe(0);
    expect(await readdir(join(appPath, 'src', 'logic-functions'))).toEqual([
      'first.ts',
      'second.ts',
    ]);
  });

  it('refuses a normalized filename collision without changing the existing definition', async () => {
    await runJson(['logic-function', '--name', 'SendInvoice']);
    const path = join(appPath, 'src/logic-functions/send-invoice.ts');
    const original = await readFile(path, 'utf8');
    const result = await runJson(['logic-function', '--name', 'send-invoice']);

    expect(result.exitCode).toBe(6);
    expect(result.envelope.error.code).toBe('APP_PATH_UNAVAILABLE');
    expect(await readFile(path, 'utf8')).toBe(original);
    expect(await readdir(join(appPath, 'src/logic-functions'))).toEqual([
      'send-invoice.ts',
    ]);
  });

  it('refuses a symlinked destination before writing outside the app', async () => {
    const outside = join(root, 'outside');

    await mkdir(outside);
    await symlink(outside, join(appPath, 'src'));
    const result = await runJson(['logic-function', '--name', 'send-invoice']);

    expect(result.exitCode).toBe(6);
    expect(await readdir(outside)).toEqual([]);
  });

  it.each([
    [],
    ['object', '--name', 'invoice'],
    ['object', '--name', 'invoice', '--name-plural', 'invoice'],
    ['field', '--name', 'amount'],
    ['field', '--name', 'amount', '--object', 'fill-later'],
    [
      'field',
      '--name',
      'amount',
      '--object',
      'aaaaaaaa-aaaa-1aaa-8aaa-aaaaaaaaaaaa',
    ],
    [
      'field',
      '--name',
      'amount',
      '--object',
      OBJECT_IDENTIFIER,
      '--type',
      'BOGUS',
    ],
    [
      'field',
      '--name',
      'amount',
      '--object',
      OBJECT_IDENTIFIER,
      '--on-delete',
      'CASCADE',
    ],
    [
      'field',
      '--name',
      'invoices',
      '--object',
      OBJECT_IDENTIFIER,
      '--type',
      'RELATION',
    ],
    ['view', '--name', 'invoices'],
    ['logic-function', '--name', '../..'],
    ['logic-function', '--name', 'send-invoice', '--name-plural', 'invoices'],
  ])(
    'rejects incomplete or invalid input %j without prompting or writing',
    async (...args) => {
      const result = await runJson(args);

      expect(result.exitCode, result.stdout).toBe(2);
      expect(result.envelope.error.code).toBe('USAGE');
      expect(promptForAppAddValue).not.toHaveBeenCalled();
      expect(await readdir(appPath)).toEqual(['package.json']);
    },
  );

  it('retains relation endpoint identifiers and creates only the requested field', async () => {
    const targetObject = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
    const targetField = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
    const result = await runJson([
      'field',
      '--name',
      'invoices',
      '--object',
      OBJECT_IDENTIFIER,
      '--type',
      'MORPH_RELATION',
      '--target-object',
      targetObject,
      '--target-field',
      targetField,
      '--relation-type',
      'ONE_TO_MANY',
      '--on-delete',
      'None',
    ]);

    expect(result.exitCode, result.stdout).toBe(0);
    const content = await readFile(
      join(appPath, 'src/fields/invoices.ts'),
      'utf8',
    );

    expect(content).toContain(
      `objectUniversalIdentifier: '${OBJECT_IDENTIFIER}'`,
    );
    expect(content).toContain(
      `relationTargetObjectMetadataUniversalIdentifier: '${targetObject}'`,
    );
    expect(content).toContain(
      `relationTargetFieldMetadataUniversalIdentifier: '${targetField}'`,
    );
    expect(content).toContain('morphId:');
    expect(content).not.toContain('OnDeleteAction');
    expect(await readdir(join(appPath, 'src/fields'))).toEqual(['invoices.ts']);
  });

  it('accepts newer universal identifier versions supported by the manifest validator', async () => {
    const identifier = 'aaaaaaaa-aaaa-7aaa-8aaa-aaaaaaaaaaaa';
    const result = await runJson([
      'field',
      '--name',
      'amount',
      '--object',
      identifier,
    ]);

    expect(result.exitCode, result.stdout).toBe(0);
    expect(
      await readFile(join(appPath, 'src/fields/amount.ts'), 'utf8'),
    ).toContain(`objectUniversalIdentifier: '${identifier}'`);
  });

  it('prompts only in a human interactive terminal and reports the created file', async () => {
    vi.stubEnv('CI', 'false');
    vi.spyOn(process, 'stdin', 'get').mockReturnValue(
      createStandardInputStub({ isTerminal: true }),
    );
    vi.mocked(promptForAppAddValue)
      .mockResolvedValueOnce('logic-function')
      .mockResolvedValueOnce('send-invoice');
    const result = await run([]);

    expect(result.exitCode, result.stderr).toBe(0);
    expect(result.stdout).toContain(
      'Created src/logic-functions/send-invoice.ts',
    );
    expect(promptForAppAddValue).toHaveBeenCalledTimes(2);
  });

  it.each([false, true])(
    'offers all companions before writing, accepted=%s',
    async (accepted) => {
      vi.stubEnv('CI', 'false');
      vi.spyOn(process, 'stdin', 'get').mockReturnValue(
        createStandardInputStub({ isTerminal: true }),
      );
      vi.mocked(confirmInTerminal).mockImplementation(async () => {
        expect(await readdir(appPath)).toEqual(['package.json']);
        return accepted;
      });

      const result = await run([
        'object',
        '--name',
        'invoice',
        '--name-plural',
        'invoices',
        '--label',
        'Invoice',
        '--label-plural',
        'Invoices',
      ]);

      expect(result.exitCode, result.stderr).toBe(0);
      expect(confirmInTerminal).toHaveBeenCalledExactlyOnceWith({
        question:
          'Also create a view, navigation menu item, and record page layout for this object?',
        signal: expect.any(AbortSignal),
      });
      expect(result.stdout).toContain('Created src/objects/invoice.ts');
      expect(result.stdout.includes('Created src/views/all-invoice.ts')).toBe(
        accepted,
      );
      expect(
        result.stdout.includes('Created src/navigation-menu-items/invoice.ts'),
      ).toBe(accepted);
      expect(
        result.stdout.includes(
          'Created src/page-layouts/invoice-record-page-layout.ts',
        ),
      ).toBe(accepted);
      expect(await readdir(join(appPath, 'src'))).toEqual(
        accepted
          ? ['navigation-menu-items', 'objects', 'page-layouts', 'views']
          : ['objects'],
      );
    },
  );

  it.each([
    '--create-view',
    '--create-navigation-menu-item',
    '--create-page-layout',
  ])('honors %s without asking about other companions', async (flag) => {
    vi.stubEnv('CI', 'false');
    vi.spyOn(process, 'stdin', 'get').mockReturnValue(
      createStandardInputStub({ isTerminal: true }),
    );
    const result = await run([
      'object',
      '--name',
      'invoice',
      '--name-plural',
      'invoices',
      '--label',
      'Invoice',
      '--label-plural',
      'Invoices',
      flag,
    ]);

    expect(result.exitCode, result.stderr).toBe(0);
    expect(confirmInTerminal).not.toHaveBeenCalled();
    expect(result.stdout.includes('Created src/views/all-invoice.ts')).toBe(
      flag === '--create-view',
    );
    expect(
      result.stdout.includes('Created src/navigation-menu-items/invoice.ts'),
    ).toBe(flag === '--create-navigation-menu-item');
    expect(
      result.stdout.includes(
        'Created src/page-layouts/invoice-record-page-layout.ts',
      ),
    ).toBe(flag === '--create-page-layout');
  });

  it.each([
    { flags: ['--no-input'], isTerminal: true, continuousIntegration: 'false' },
    { flags: ['--json'], isTerminal: true, continuousIntegration: 'false' },
    { flags: [], isTerminal: false, continuousIntegration: 'false' },
    { flags: [], isTerminal: true, continuousIntegration: 'true' },
  ])(
    'creates only the object without prompting in noninteractive mode %j',
    async ({ flags, isTerminal, continuousIntegration }) => {
      vi.stubEnv('CI', continuousIntegration);
      vi.spyOn(process, 'stdin', 'get').mockReturnValue(
        createStandardInputStub({ isTerminal }),
      );
      const result = await run([
        'object',
        '--name',
        'invoice',
        '--name-plural',
        'invoices',
        ...flags,
      ]);

      expect(result.exitCode, result.stderr).toBe(0);
      expect(confirmInTerminal).not.toHaveBeenCalled();
      expect(promptForAppAddValue).not.toHaveBeenCalled();
      expect(await readdir(join(appPath, 'src'))).toEqual(['objects']);
    },
  );

  it('leaves all files untouched when the companion prompt is cancelled', async () => {
    vi.stubEnv('CI', 'false');
    vi.spyOn(process, 'stdin', 'get').mockReturnValue(
      createStandardInputStub({ isTerminal: true }),
    );
    vi.mocked(confirmInTerminal).mockRejectedValue(
      new CliError({ code: 'CANCELLED', message: 'Cancelled.', exitCode: 130 }),
    );
    const result = await run([
      'object',
      '--name',
      'invoice',
      '--name-plural',
      'invoices',
      '--label',
      'Invoice',
      '--label-plural',
      'Invoices',
    ]);

    expect(result.exitCode).toBe(130);
    expect(await readdir(appPath)).toEqual(['package.json']);
  });

  it('does not prompt with --no-input', async () => {
    const result = await run(['object', '--no-input']);

    expect(result.exitCode).toBe(2);
    expect(promptForAppAddValue).not.toHaveBeenCalled();
    expect(await readdir(appPath)).toEqual(['package.json']);
  });

  it('checks the app identity before asking any interactive questions', async () => {
    vi.stubEnv('CI', 'false');
    vi.spyOn(process, 'stdin', 'get').mockReturnValue(
      createStandardInputStub({ isTerminal: true }),
    );
    vi.mocked(readAppIdentity).mockResolvedValue({
      application: null,
      diagnostics: [],
    });

    const result = await run([]);

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('No application definition found');
    expect(promptForAppAddValue).not.toHaveBeenCalled();
    expect(await readdir(appPath)).toEqual(['package.json']);
  });

  it('leaves app files untouched when the interactive prompt is cancelled', async () => {
    vi.stubEnv('CI', 'false');
    vi.spyOn(process, 'stdin', 'get').mockReturnValue(
      createStandardInputStub({ isTerminal: true }),
    );
    vi.mocked(promptForAppAddValue).mockRejectedValue(
      new CliError({ code: 'CANCELLED', message: 'Cancelled.', exitCode: 130 }),
    );

    expect((await run([])).exitCode).toBe(130);
    expect(await readdir(appPath)).toEqual(['package.json']);
  });
});
