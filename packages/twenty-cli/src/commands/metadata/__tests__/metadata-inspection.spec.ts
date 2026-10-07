import { isNonEmptyString, isString } from '@sniptt/guards';
import { Kind, parse, valueFromASTUntyped } from 'graphql';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { isPlainObject, safeGetNestedProperty } from 'twenty-shared/utils';
import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  parseSingleJsonLine,
  runCliForTest,
} from '@/__tests__/utils/run-cli-for-test';
import { sendJson, startTestServer } from '@/__tests__/utils/start-test-server';

const createObject = (
  id: string,
  nameSingular: string,
  namePlural: string,
) => ({
  id,
  nameSingular,
  namePlural,
  universalIdentifier: `universal-${id}`,
  labelSingular: 'Company',
  labelPlural: 'Companies',
  description: 'CRM companies',
  isActive: true,
  isSystem: false,
  isSearchable: true,
  labelIdentifierFieldMetadataId: 'name-id',
  applicationId: 'standard-id',
});

const createField = (
  name: string,
  overrides: Record<string, unknown> = {},
) => ({
  id: `${name}-id`,
  universalIdentifier: `universal-${name}`,
  name,
  label: name,
  description: null,
  objectMetadataId: 'company-id',
  type: 'TEXT',
  applicationId: 'standard-id',
  isActive: true,
  isSystem: false,
  isNullable: true,
  isUnique: false,
  defaultValue: null,
  options: null,
  settings: null,
  relation: null,
  morphRelations: null,
  ...overrides,
});

const RELATION = {
  type: 'ONE_TO_MANY',
  sourceObjectMetadata: {
    id: 'company-id',
    nameSingular: 'company',
    namePlural: 'companies',
  },
  targetObjectMetadata: {
    id: 'invoice-id',
    nameSingular: 'invoice',
    namePlural: 'invoices',
  },
  sourceFieldMetadata: { id: 'invoices-id', name: 'invoices' },
  targetFieldMetadata: { id: 'company-relation-id', name: 'company' },
};

const APPLICATIONS = [
  {
    id: 'standard-id',
    name: 'Twenty',
    universalIdentifier: TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
  },
  { id: 'app-id', name: 'Billing', universalIdentifier: 'billing-app' },
];
const FORBIDDEN = {
  errors: [{ message: 'Forbidden', extensions: { code: 'FORBIDDEN' } }],
  data: null,
};

let objects = [createObject('company-id', 'company', 'companies')];
let fields = [createField('name')];
let pageSize = 2;
let applicationsDenied = false;
let objectsDenied = false;
let fieldsDenied = false;
let failSecondFieldPage = false;
let invalidCursor = false;
let endlessObjects = false;

const page = <TNode>(nodes: TNode[], after?: string) => {
  const offset = Number(after ?? 0);
  const nextOffset = offset + pageSize;

  return {
    edges: nodes.slice(offset, nextOffset).map((node) => ({ node })),
    pageInfo: {
      hasNextPage: nextOffset < nodes.length,
      endCursor: invalidCursor ? '0' : String(nextOffset),
    },
  };
};

const server = await startTestServer((request, response) => {
  const body: unknown = JSON.parse(request.body);

  if (!isPlainObject(body) || !isString(body.query)) {
    throw new Error('Expected a GraphQL request');
  }

  const definition = parse(body.query).definitions[0];

  if (definition.kind !== Kind.OPERATION_DEFINITION) {
    throw new Error('Expected operation');
  }

  const selection = definition.selectionSet.selections[0];

  if (selection.kind !== Kind.FIELD) {
    throw new Error('Expected root field');
  }

  const variables = isPlainObject(body.variables) ? body.variables : undefined;
  const args = Object.fromEntries(
    (selection.arguments ?? []).map((argument) => [
      argument.name.value,
      valueFromASTUntyped(argument.value, variables),
    ]),
  );
  const pagingAfter = safeGetNestedProperty(args, 'paging.after');
  const after = isString(pagingAfter) ? pagingAfter : undefined;

  if (selection.name.value === 'objects') {
    if (objectsDenied) {
      return sendJson(response, 200, FORBIDDEN);
    }

    if (endlessObjects) {
      const offset = Number(after ?? 0);
      return sendJson(response, 200, {
        data: {
          objects: {
            edges: Array.from({ length: 1000 }, (_, index) => ({
              node: createObject(
                `id-${offset + index}`,
                `name-${offset + index}`,
                `names-${offset + index}`,
              ),
            })),
            pageInfo: { hasNextPage: true, endCursor: String(offset + 1000) },
          },
        },
      });
    }
    return sendJson(response, 200, {
      data: { objects: page(objects, after) },
    });
  }

  if (selection.name.value === 'fields') {
    if (fieldsDenied || (failSecondFieldPage && isNonEmptyString(after))) {
      return sendJson(response, 200, FORBIDDEN);
    }

    const objectMetadataId = safeGetNestedProperty(
      args,
      'filter.objectMetadataId.eq',
    );

    return sendJson(response, 200, {
      data: {
        fields: page(
          fields.filter((field) => field.objectMetadataId === objectMetadataId),
          after,
        ),
      },
    });
  }

  if (selection.name.value === 'currentWorkspace') {
    return sendJson(response, 200, {
      data: { currentWorkspace: { workspaceCustomApplicationId: 'custom-id' } },
    });
  }

  if (selection.name.value === 'findManyApplications') {
    return sendJson(
      response,
      200,
      applicationsDenied
        ? FORBIDDEN
        : { data: { findManyApplications: APPLICATIONS } },
    );
  }

  return sendJson(response, 400, { errors: [{ message: 'Unexpected query' }] });
});

const runJson = async (args: string[]) => {
  const result = await runCliForTest(['metadata', ...args, '--json']);
  return { ...result, envelope: parseSingleJsonLine(result.stdout) };
};

describe('metadata inspection commands', () => {
  beforeEach(() => {
    vi.stubEnv('TWENTY_API_URL', server.url);
    vi.stubEnv('TWENTY_API_KEY', 'fixture-key');
    vi.stubEnv('TWENTY_REMOTE', '');
    objects = [createObject('company-id', 'company', 'companies')];
    fields = [
      createField('name', { isNullable: false }),
      createField('tier', {
        label: 'Tier',
        type: 'SELECT',
        applicationId: 'custom-id',
        defaultValue: "'GOLD'",
        options: [
          { id: 'gold', label: 'Gold', value: 'GOLD', color: 'yellow' },
        ],
      }),
      createField('invoices', {
        type: 'RELATION',
        applicationId: 'app-id',
        relation: RELATION,
      }),
      createField('secret', { applicationId: 'unreadable-app' }),
      createField('id', { type: 'UUID', isSystem: true }),
      createField('foreign', { objectMetadataId: 'other-object-id' }),
    ];
    pageSize = 2;
    applicationsDenied = false;
    objectsDenied = false;
    fieldsDenied = false;
    failSecondFieldPage = false;
    invalidCursor = false;
    endlessObjects = false;
    server.requests.length = 0;
  });

  afterEach(() => vi.unstubAllEnvs());
  afterAll(async () => server.close());

  it.each(['company', 'companies'])(
    'describes exact API alias %s with object properties only',
    async (name) => {
      const { envelope, exitCode } = await runJson([
        'object',
        'describe',
        name,
      ]);
      expect(exitCode).toBe(0);
      expect(Object.keys(envelope.data)).toEqual(['object']);
      expect(envelope.data.object).toMatchObject({
        id: 'company-id',
        owner: { kind: 'standard' },
      });
      expect(envelope.warnings).toEqual([]);
      expect(
        server.requests.every(
          (request) =>
            request.path === '/metadata' &&
            request.headers.authorization === 'Bearer fixture-key',
        ),
      ).toBe(true);
    },
  );

  it.each(['company', 'companies'])(
    'lists fields of exact API alias %s with per-field owners',
    async (name) => {
      const { envelope, exitCode } = await runJson(['field', 'list', name]);
      expect(exitCode).toBe(0);
      expect(
        envelope.data.fields.map(
          (field: { name: string; owner: { kind: string } }) => [
            field.name,
            field.owner.kind,
          ],
        ),
      ).toEqual([
        ['invoices', 'application'],
        ['name', 'standard'],
        ['secret', 'unknown'],
        ['tier', 'custom'],
      ]);
      expect(envelope.data.hiddenSystemFieldCount).toBe(1);
    },
  );

  it('includes system fields in field list with --all', async () => {
    const { envelope } = await runJson(['field', 'list', 'companies', '--all']);
    expect(
      envelope.data.fields.map((field: { name: string }) => field.name),
    ).toEqual(['id', 'invoices', 'name', 'secret', 'tier']);
    expect(envelope.data.hiddenSystemFieldCount).toBe(0);
  });

  it('describes a system field without --all', async () => {
    const { envelope, exitCode } = await runJson([
      'field',
      'describe',
      'companies',
      'id',
    ]);
    expect(exitCode).toBe(0);
    expect(envelope.data.field).toMatchObject({
      name: 'id',
      type: 'UUID',
      isSystem: true,
    });
  });

  it('preserves select values, defaults and relation endpoints in JSON', async () => {
    const tier = await runJson(['field', 'describe', 'companies', 'tier']);
    expect(tier.envelope.data.field).toMatchObject({
      defaultValue: "'GOLD'",
      options: [{ label: 'Gold', value: 'GOLD' }],
    });
    const relation = await runJson([
      'field',
      'describe',
      'company',
      'invoices',
    ]);
    expect(relation.envelope.data.field.relation).toEqual(RELATION);
  });

  it('renders human field details and select values', async () => {
    const { stdout, exitCode } = await runCliForTest([
      'metadata',
      'field',
      'describe',
      'companies',
      'tier',
    ]);
    expect(exitCode).toBe(0);
    for (const text of [
      'Tier (tier) on companies',
      'Custom',
      'SELECT',
      'Nullable',
      'OPTION',
      'VALUE',
      'Gold',
      'GOLD',
      'yellow',
    ]) {
      expect(stdout).toContain(text);
    }
  });

  it('renders only object properties in object describe', async () => {
    const { stdout, exitCode } = await runCliForTest([
      'metadata',
      'object',
      'describe',
      'companies',
    ]);
    expect(exitCode).toBe(0);
    for (const text of [
      'Companies (companies)',
      'company / companies',
      'Fields: twenty metadata field list companies',
    ]) {
      expect(stdout).toContain(text);
    }
    expect(stdout).toMatch(/Description\s+CRM companies/);
    expect(stdout).not.toContain('invoices');
    expect(stdout).not.toContain('system fields hidden');
  });

  it('renders relations, label fields and system-field guidance', async () => {
    const { stdout, exitCode } = await runCliForTest([
      'metadata',
      'field',
      'list',
      'companies',
    ]);
    expect(exitCode).toBe(0);
    for (const text of [
      'Companies (companies)',
      'label field',
      'one-to-many',
      'invoices.company',
      'Billing',
      'system fields hidden',
      '--all',
    ]) {
      expect(stdout).toContain(text);
    }
  });

  it('keeps unknown nullable constraints unknown in human output', async () => {
    fields = [createField('name', { isNullable: null, isUnique: null })];
    const { stdout, exitCode } = await runCliForTest([
      'metadata',
      'field',
      'describe',
      'companies',
      'name',
    ]);
    expect(exitCode).toBe(0);
    expect(stdout).toMatch(/Nullable\s+unknown/);
    expect(stdout).toMatch(/Unique\s+unknown/);
  });

  it.each(['Companies', 'COMPANIES', 'compan'])(
    'does not resolve label or fuzzy name %s',
    async (name) => {
      const { envelope, exitCode } = await runJson([
        'object',
        'describe',
        name,
      ]);
      expect(exitCode).toBe(4);
      expect(envelope.error.code).toBe('NOT_FOUND');
      expect(server.requests).toHaveLength(1);
    },
  );

  it('finds objects beyond the first page', async () => {
    objects.unshift(
      createObject('first', 'first', 'firsts'),
      createObject('second', 'second', 'seconds'),
    );
    const { envelope, exitCode } = await runJson(['field', 'list', 'company']);
    expect(exitCode).toBe(0);
    expect(envelope.data.object.id).toBe('company-id');
  });

  it('rejects a singular/plural ambiguity on a later page before fetching fields', async () => {
    pageSize = 1;
    objects.push(createObject('collision', 'companies', 'firms'));
    const { envelope, exitCode } = await runJson([
      'object',
      'describe',
      'companies',
    ]);
    expect(exitCode).toBe(2);
    expect(envelope.error.code).toBe('AMBIGUOUS_RESOURCE');
    expect(envelope.error.details.matches).toHaveLength(2);
    expect(server.requests).toHaveLength(2);
  });

  it('accepts identical singular and plural names on one object', async () => {
    objects = [createObject('company-id', 'series', 'series')];
    expect((await runJson(['object', 'describe', 'series'])).exitCode).toBe(0);
  });

  it.each(['Tier', 'foreign', 'missing'])(
    'does not select an inexact or foreign field %s',
    async (name) => {
      const { envelope, exitCode } = await runJson([
        'field',
        'describe',
        'companies',
        name,
      ]);
      expect(exitCode).toBe(4);
      expect(envelope.error.code).toBe('NOT_FOUND');
    },
  );

  it('does not inherit object ownership when application names are denied', async () => {
    applicationsDenied = true;
    const { envelope, exitCode } = await runJson([
      'field',
      'list',
      'companies',
    ]);
    expect(exitCode).toBe(0);
    expect(envelope.data.object.owner.kind).toBe('unknown');
    expect(
      envelope.data.fields.find(
        (field: { name: string }) => field.name === 'tier',
      ).owner.kind,
    ).toBe('custom');
    expect(
      envelope.data.fields.find(
        (field: { name: string }) => field.name === 'invoices',
      ).owner.kind,
    ).toBe('unknown');
    expect(envelope.warnings).toEqual([
      expect.objectContaining({ code: 'OWNERS_UNAVAILABLE' }),
    ]);
  });

  it.each(['objects', 'fields', 'secondFieldPage'])(
    'preserves permission failures at %s without partial success',
    async (stage) => {
      objectsDenied = stage === 'objects';
      fieldsDenied = stage === 'fields';
      failSecondFieldPage = stage === 'secondFieldPage';
      const { envelope, exitCode } = await runJson([
        'object',
        'describe',
        'companies',
      ]);
      expect(exitCode).toBe(3);
      expect(envelope.error.code).toBe('PERMISSION_DENIED');
      expect(envelope).not.toHaveProperty('data');
    },
  );

  it('fails a repeated cursor instead of looping or reporting an incomplete match', async () => {
    pageSize = 1;
    invalidCursor = true;
    objects.push(createObject('other', 'other', 'others'));
    const { envelope, exitCode } = await runJson([
      'object',
      'describe',
      'companies',
    ]);
    expect(exitCode).toBe(1);
    expect(envelope.error.code).toBe('INVALID_RESPONSE');
    expect(server.requests).toHaveLength(2);
  });

  it('bounds metadata traversal by item count', async () => {
    endlessObjects = true;
    const { envelope, exitCode } = await runJson([
      'object',
      'describe',
      'missing',
    ]);
    expect(exitCode).toBe(1);
    expect(envelope.error.code).toBe('RESPONSE_LIMIT_EXCEEDED');
    expect(server.requests).toHaveLength(11);
  });

  it('does not reuse metadata across invocations', async () => {
    expect(
      (await runJson(['field', 'describe', 'companies', 'tier'])).exitCode,
    ).toBe(0);
    fields = fields.filter((field) => field.name !== 'tier');
    expect(
      (await runJson(['field', 'describe', 'companies', 'tier'])).exitCode,
    ).toBe(4);
  });

  it('bounds accumulated bytes across individually valid pages', async () => {
    pageSize = 1;
    objects = [
      {
        ...createObject('first', 'first', 'firsts'),
        description: 'x'.repeat(9 * 1024 * 1024),
      },
      {
        ...createObject('second', 'second', 'seconds'),
        description: 'x'.repeat(9 * 1024 * 1024),
      },
    ];

    const { envelope, exitCode } = await runJson([
      'object',
      'describe',
      'first',
    ]);

    expect(exitCode).toBe(1);
    expect(envelope.error.code).toBe('RESPONSE_LIMIT_EXCEEDED');
    expect(server.requests).toHaveLength(2);
  });

  it('ignores matching labels on other objects when resolving an exact API name', async () => {
    objects.push({
      ...createObject('other', 'other', 'others'),
      labelPlural: 'companies',
    });

    const { envelope, exitCode } = await runJson([
      'object',
      'describe',
      'companies',
    ]);

    expect(exitCode).toBe(0);
    expect(envelope.data.object.id).toBe('company-id');
  });

  it('shows only the target of each polymorphic relation field', async () => {
    const createMorphRelation = (
      fieldName: string,
      target: { id: string; nameSingular: string; namePlural: string },
    ) => ({
      type: 'MANY_TO_ONE',
      sourceObjectMetadata: {
        id: 'company-id',
        nameSingular: 'company',
        namePlural: 'companies',
      },
      targetObjectMetadata: target,
      sourceFieldMetadata: { id: `${fieldName}-id`, name: 'target' },
      targetFieldMetadata: {
        id: `${target.namePlural}-companies-id`,
        name: 'companies',
      },
    });
    const morphRelations = [
      createMorphRelation('targetInvoice', {
        id: 'invoice-id',
        nameSingular: 'invoice',
        namePlural: 'invoices',
      }),
      createMorphRelation('targetPerson', {
        id: 'person-id',
        nameSingular: 'person',
        namePlural: 'people',
      }),
    ];

    fields = [
      createField('targetInvoice', { type: 'MORPH_RELATION', morphRelations }),
      createField('targetPerson', { type: 'MORPH_RELATION', morphRelations }),
    ];

    const described = await runCliForTest([
      'metadata',
      'field',
      'describe',
      'companies',
      'targetInvoice',
    ]);
    const listed = await runCliForTest([
      'metadata',
      'field',
      'list',
      'companies',
    ]);
    const personLine = listed.stdout
      .split('\n')
      .find((line) => line.includes('targetPerson'));

    expect(described.exitCode).toBe(0);
    expect(described.stdout).toContain('MORPH_RELATION');
    expect(described.stdout).toContain('many-to-one · invoices.companies');
    expect(described.stdout).not.toContain('people.companies');
    expect(personLine).toContain('many-to-one · people.companies');
    expect(personLine).not.toContain('invoices.companies');
    expect(
      (await runJson(['field', 'describe', 'companies', 'targetInvoice']))
        .envelope.data.field.morphRelations,
    ).toEqual(morphRelations);
  });

  it('handles missing arguments and help without a configured target', async () => {
    vi.stubEnv('TWENTY_API_URL', '');
    vi.stubEnv('TWENTY_API_KEY', '');
    const missing = await runJson(['field', 'describe', 'companies']);
    expect(missing.exitCode).toBe(2);
    expect(missing.envelope.error.code).toBe('USAGE');
    const help = await runJson(['field', 'describe', '--help']);
    expect(help.exitCode).toBe(0);
    expect(help.envelope.data.help).toContain('<object> <field>');
    expect(server.requests).toHaveLength(0);
  });
});
