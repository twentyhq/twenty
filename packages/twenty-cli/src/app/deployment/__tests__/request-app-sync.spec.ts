import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import { sendJson, startTestServer } from '@/__tests__/utils/start-test-server';
import { requestAppSync } from '@/app/deployment/request-app-sync';
import { parseAppPlan } from '@/app/deployment/parse-app-plan';
import { type ToolingBuild } from '@/app/types/tooling-result.type';

const state = { code: 'GRAPHQL_VALIDATION_FAILED', reject: true };
const server = await startTestServer((request, response) => {
  const { query } = JSON.parse(request.body);
  if (state.reject && query.includes('translationActions')) {
    sendJson(response, 400, {
      errors: [
        {
          message:
            'Cannot query field "translationActions" on type "WorkspaceMigration".',
          extensions: { code: state.code },
        },
      ],
    });
    return;
  }
  sendJson(response, 200, {
    data: {
      syncApplication: {
        applicationUniversalIdentifier: 'app',
        actions: [],
        ...(state.reject ? {} : { translationActions: null }),
      },
    },
  });
});
const build: ToolingBuild = {
  buildId: 'build',
  contentHash: 'hash',
  files: [],
  application: { universalIdentifier: 'app', name: 'app', displayName: 'App' },
  manifest: { application: { universalIdentifier: 'app' } },
  manifestFormat: 'twenty-application',
};
const request = (dryRun: boolean) =>
  requestAppSync({
    build,
    dryRun,
    inferDeletionFromMissingEntities: true,
    target: {
      apiUrl: server.url,
      bearerToken: 'test',
      credentialKind: 'apiKey',
      source: 'environment',
    },
    signal: new AbortController().signal,
  });

beforeEach(() => {
  state.code = 'GRAPHQL_VALIDATION_FAILED';
  state.reject = true;
  server.requests.length = 0;
});
afterAll(() => server.close());

describe('translation report compatibility', () => {
  it.each([true, false])(
    'retries only schema validation on older servers, dryRun=%s',
    async (dryRun) => {
      const response = await request(dryRun);
      expect(server.requests).toHaveLength(2);
      const first = JSON.parse(server.requests[0].body);
      const second = JSON.parse(server.requests[1].body);
      expect(first.query).toContain('translationActions');
      expect(second.query).not.toContain('translationActions');
      expect(second.variables).toEqual(first.variables);
      expect(
        parseAppPlan({
          value: response.syncApplication,
          applicationUniversalIdentifier: 'app',
        }),
      ).toEqual({
        actions: [],
        translationActions: undefined,
      });
    },
  );

  it('does not retry a mutation after an execution failure with similar text', async () => {
    state.code = 'INTERNAL_SERVER_ERROR';
    await expect(request(false)).rejects.toMatchObject({
      code: 'GRAPHQL_ERROR',
    });
    expect(server.requests).toHaveLength(1);
  });

  it('keeps failed translation sync distinct from an empty successful report', async () => {
    state.reject = false;
    const response = await request(false);
    expect(
      parseAppPlan({
        value: response.syncApplication,
        applicationUniversalIdentifier: 'app',
      }).translationActions,
    ).toBeNull();
    expect(
      parseAppPlan({
        value: { ...response.syncApplication, translationActions: [] },
        applicationUniversalIdentifier: 'app',
      }).translationActions,
    ).toEqual([]);
    expect(server.requests).toHaveLength(1);
  });
});
