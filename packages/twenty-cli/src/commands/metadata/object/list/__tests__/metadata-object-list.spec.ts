import { type ServerResponse } from 'node:http';

import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
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

type ScenarioName =
  | 'named'
  | 'appsDenied'
  | 'objectsDenied'
  | 'paginated'
  | 'repeatedCursor'
  | 'missingCursor'
  | 'laterPageDenied'
  | 'appsPending';

const objectNode = (
  namePlural: string,
  applicationId: string,
  isSystem = false,
) => ({
  node: {
    nameSingular: namePlural.replace(/s$/, ''),
    namePlural,
    labelSingular: namePlural,
    labelPlural: namePlural,
    isSystem,
    isActive: true,
    applicationId,
  },
});

const objectsResponse = (hasNextPage: boolean) => ({
  data: {
    objects: {
      pageInfo: { hasNextPage, endCursor: hasNextPage ? 'next-page' : null },
      edges: [
        objectNode('surveyResults', 'custom-id'),
        objectNode('people', 'standard-id'),
        objectNode('invoices', 'invoices-id'),
        objectNode('companies', 'standard-id'),
        objectNode('workspaceMembers', 'standard-id', true),
        objectNode('secrets', 'hidden-id'),
      ],
    },
    currentWorkspace: { workspaceCustomApplicationId: 'custom-id' },
  },
});

const APPLICATIONS_RESPONSE = {
  data: {
    findManyApplications: [
      {
        id: 'standard-id',
        name: 'Twenty Standard',
        universalIdentifier: TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
      },
      {
        id: 'invoices-id',
        name: 'Acme Invoices',
        universalIdentifier: 'invoices-universal-identifier',
      },
    ],
  },
};

const FORBIDDEN_RESPONSE = {
  errors: [
    { message: 'Forbidden resource', extensions: { code: 'FORBIDDEN' } },
  ],
  data: null,
};

let scenario: ScenarioName = 'named';
const requestedCursors: unknown[] = [];
const pendingResponses: ServerResponse[] = [];

const server = await startTestServer((request, response) => {
  const isApplicationsLookup = request.body.includes('findManyApplications');

  if (scenario === 'appsPending' && isApplicationsLookup) {
    pendingResponses.push(response);

    return;
  }

  if (scenario === 'appsPending' || scenario === 'objectsDenied') {
    return sendJson(
      response,
      200,
      isApplicationsLookup ? APPLICATIONS_RESPONSE : FORBIDDEN_RESPONSE,
    );
  }

  if (isApplicationsLookup) {
    return sendJson(
      response,
      200,
      scenario === 'appsDenied' ? FORBIDDEN_RESPONSE : APPLICATIONS_RESPONSE,
    );
  }

  const { variables } = JSON.parse(request.body);
  const after = Object.values(variables).find(
    (value) => typeof value === 'object' && value !== null && 'after' in value,
  ) as { after?: string } | undefined;

  requestedCursors.push(after?.after ?? null);

  if (scenario === 'laterPageDenied' && after?.after) {
    return sendJson(response, 200, FORBIDDEN_RESPONSE);
  }

  if (scenario === 'paginated' && after?.after === 'next-page') {
    return sendJson(response, 200, {
      data: {
        objects: {
          pageInfo: { hasNextPage: false },
          edges: [
            objectNode('deals', 'custom-id'),
            objectNode('tokens', 'standard-id', true),
          ],
        },
        currentWorkspace: { workspaceCustomApplicationId: 'custom-id' },
      },
    });
  }

  const result = objectsResponse(
    [
      'paginated',
      'repeatedCursor',
      'missingCursor',
      'laterPageDenied',
    ].includes(scenario),
  );

  if (scenario === 'missingCursor') {
    result.data.objects.pageInfo.endCursor = null;
  }

  return sendJson(response, 200, result);
});

const listObjects = async (options: string[] = []) => {
  const { stdout, exitCode } = await runCliForTest([
    'metadata',
    'object',
    'list',
    ...options,
    '--json',
  ]);

  return { envelope: parseSingleJsonLine(stdout), exitCode };
};

const summarizeOwners = (
  objects: {
    namePlural: string;
    owner: { kind: string; name: string | null };
  }[],
) =>
  objects.map(({ namePlural, owner }) => [namePlural, owner.kind, owner.name]);

describe('metadata object list', () => {
  beforeEach(() => {
    vi.stubEnv('TWENTY_API_URL', server.url);
    vi.stubEnv('TWENTY_API_KEY', 'test-key');
    vi.stubEnv('TWENTY_REMOTE', '');
    scenario = 'named';
    requestedCursors.length = 0;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  afterAll(async () => {
    await server.close();
  });

  it('lists non-system objects grouped by owner', async () => {
    const { envelope, exitCode } = await listObjects();

    expect(exitCode).toBe(0);
    expect(envelope.warnings).toEqual([]);
    expect(envelope.data.hiddenSystemObjectCount).toBe(1);
    expect(summarizeOwners(envelope.data.objects)).toEqual([
      ['companies', 'standard', null],
      ['people', 'standard', null],
      ['invoices', 'application', 'Acme Invoices'],
      ['surveyResults', 'custom', null],
      ['secrets', 'unknown', null],
    ]);
  });

  it('includes system objects with --all', async () => {
    const { envelope } = await listObjects(['--all']);

    expect(envelope.data.hiddenSystemObjectCount).toBe(0);
    expect(envelope.data.objects).toHaveLength(6);
  });

  it('still lists objects when app names are not readable', async () => {
    scenario = 'appsDenied';

    const { envelope, exitCode } = await listObjects();

    expect(exitCode).toBe(0);
    expect(summarizeOwners(envelope.data.objects)).toEqual([
      ['surveyResults', 'custom', null],
      ['companies', 'unknown', null],
      ['invoices', 'unknown', null],
      ['people', 'unknown', null],
      ['secrets', 'unknown', null],
    ]);
    expect(envelope.warnings).toEqual([
      expect.objectContaining({ code: 'OWNERS_UNAVAILABLE' }),
    ]);
  });

  it('fails without a misleading warning when objects are not readable', async () => {
    scenario = 'objectsDenied';

    const { envelope, exitCode } = await listObjects();

    expect(exitCode).toBe(3);
    expect(envelope.error.code).toBe('PERMISSION_DENIED');
    expect(envelope.warnings).toEqual([]);
  });

  it.each([false, true])(
    'lists every page before filtering system objects (all: %s)',
    async (includeSystem) => {
      scenario = 'paginated';

      const { envelope, exitCode } = await listObjects(
        includeSystem ? ['--all'] : [],
      );

      expect(exitCode).toBe(0);
      expect(envelope.warnings).toEqual([]);
      expect(requestedCursors).toEqual([null, 'next-page']);
      expect(envelope.data.objects).toHaveLength(includeSystem ? 8 : 6);
      expect(envelope.data.hiddenSystemObjectCount).toBe(includeSystem ? 0 : 2);
      expect(envelope.data.objects).toContainEqual(
        expect.objectContaining({
          namePlural: 'deals',
          owner: expect.objectContaining({ kind: 'custom' }),
        }),
      );
    },
  );

  it.each(['repeatedCursor', 'missingCursor'] as const)(
    'fails instead of returning a partial list for %s',
    async (paginationScenario) => {
      scenario = paginationScenario;

      const { envelope, exitCode } = await listObjects();

      expect(exitCode).toBe(1);
      expect(envelope.error.code).toBe('INVALID_RESPONSE');
      expect(envelope).not.toHaveProperty('data');
      expect(requestedCursors.length).toBeLessThanOrEqual(2);
    },
  );

  it('fails instead of returning a partial list when a later page is denied', async () => {
    scenario = 'laterPageDenied';

    const { envelope, exitCode } = await listObjects();

    expect(exitCode).toBe(3);
    expect(envelope.error.code).toBe('PERMISSION_DENIED');
    expect(envelope).not.toHaveProperty('data');
  });

  it('cancels the app lookup once the command has failed', async () => {
    scenario = 'appsPending';

    const { envelope } = await listObjects();

    expect(envelope.error.code).toBe('PERMISSION_DENIED');
    await vi.waitFor(() => {
      expect(pendingResponses).toHaveLength(1);
      expect(pendingResponses[0].destroyed).toBe(true);
    });
  });
});
